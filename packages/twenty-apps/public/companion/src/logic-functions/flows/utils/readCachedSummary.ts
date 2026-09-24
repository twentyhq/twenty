import { kv } from 'twenty-sdk/logic-function';
import { asRecord } from 'src/logic-functions/utils/asRecord';
import { type CachedSummary } from 'src/logic-functions/types/CachedSummary';

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
