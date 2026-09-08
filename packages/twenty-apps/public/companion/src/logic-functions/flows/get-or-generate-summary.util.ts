import { kv, runAgent } from 'twenty-sdk/logic-function';

import { CALL_RECORDING_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { claimSummaryGeneration } from 'src/logic-functions/data/claim-summary-generation.util';
import { parseCallRecordingSummaryAgentResponse } from 'src/logic-functions/domain/parse-call-recording-summary-agent-response.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';

export type CachedSummary =
  | {
      status: 'READY';
      markdown: string;
      outcome: 'generated' | 'not-summarizable';
    }
  | { status: 'EMPTY' }
  | { status: 'RUNNING' }
  | { status: 'INTERRUPTED' };

export const readCachedSummary = async (
  key: string,
): Promise<CachedSummary | null> => {
  const value = asRecord(await kv.get(key));
  if (!value) return null;
  if (value.status === 'RUNNING') {
    const startedAt =
      typeof value.startedAt === 'string' ? Date.parse(value.startedAt) : NaN;
    return {
      status:
        Number.isFinite(startedAt) && Date.now() - startedAt < 15 * 60_000
          ? 'RUNNING'
          : 'INTERRUPTED',
    };
  }
  if (value.status === 'EMPTY') return { status: 'EMPTY' };
  if (
    value.status === 'READY' &&
    typeof value.markdown === 'string' &&
    (value.outcome === 'generated' || value.outcome === 'not-summarizable')
  ) {
    return {
      status: 'READY',
      markdown: value.markdown,
      outcome: value.outcome,
    };
  }
  throw new Error('Stored summary result is invalid.');
};

export const getOrGenerateSummary = async (
  key: string,
  prompt: string,
): Promise<CachedSummary> => {
  const cached = await readCachedSummary(key);
  if (cached) return cached;
  if (!(await claimSummaryGeneration(key)))
    return (await readCachedSummary(key)) ?? { status: 'RUNNING' };

  // A claim does not expire: an interrupted paid request has an uncertain outcome.
  const response = await runAgent({
    agentUniversalIdentifier:
      CALL_RECORDING_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
    prompt,
  });
  if (!response.success) {
    // A definite failed response has no result to recover; a later delivery may try again.
    await kv.delete(key);
    throw new Error('Summary generation returned no usable result.');
  }
  const parsed = parseCallRecordingSummaryAgentResponse(response);
  if (!parsed) throw new Error('Summary generation returned no usable result.');
  const result: CachedSummary = {
    status: 'READY',
    markdown:
      parsed.outcome === 'not-summarizable'
        ? `## Summary unavailable\n\n${parsed.reason}`
        : parsed.markdown,
    outcome:
      parsed.outcome === 'not-summarizable' ? 'not-summarizable' : 'generated',
  };

  // Retry persisting the same paid result; never repeat generation to repair a save.
  for (let attempt = 0; ; attempt++) {
    try {
      await kv.set(key, result);
      break;
    } catch (error) {
      if (attempt >= 3) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
    }
  }
  return result;
};
