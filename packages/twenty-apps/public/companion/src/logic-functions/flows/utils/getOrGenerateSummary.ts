import { kv, runAgent } from 'twenty-sdk/logic-function';
import { CALL_RECORDING_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/CALL_RECORDING_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER';
import { parseCallRecordingSummaryAgentResponse } from 'src/logic-functions/domain/utils/parseCallRecordingSummaryAgentResponse';
import { type CachedSummary } from 'src/logic-functions/types/CachedSummary';
import { readCachedSummary } from 'src/logic-functions/flows/utils/readCachedSummary';

export const getOrGenerateSummary = async (
  key: string,
  prompt: string,
): Promise<CachedSummary> => {
  const cached = await readCachedSummary(key);
  if (cached) return cached;
  // The queue serializes generation; this marker preserves uncertain paid attempts on retries.
  await kv.set(key, { status: 'RUNNING', startedAt: new Date().toISOString() });
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
