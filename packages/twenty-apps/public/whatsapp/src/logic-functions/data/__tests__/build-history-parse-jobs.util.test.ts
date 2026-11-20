import { describe, expect, it } from 'vitest';
import { buildHistoryParseJobs } from 'src/logic-functions/data/build-history-parse-jobs.util';

const BUSINESS_DATA = { display_phone_number: '15550783881', phone_number_id: 'phone-number-id' };

const buildMessage = (from: string) => ({
  from,
  id: `wamid.${from}`,
  timestamp: '1700000000',
  type: 'text' as const,
  text: { body: 'Hello' },
  history_context: { status: 'READ' as const },
});

describe('buildHistoryParseJobs', () => {
  it('should fall back to the thread context phone number when the thread id is omitted', () => {
    const jobs = buildHistoryParseJobs(BUSINESS_DATA, [
      {
        metadata: { phase: 0, chunk_order: 1, progress: 100 },
        threads: [{ context: { wa_id: '16505551234' }, messages: [buildMessage('15550783881')] }],
      },
    ]);

    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.payload.contacts.wa_id).toBe('16505551234');
  });

  it('should keep threads of users who hide their phone number, keyed by their user ID', () => {
    const jobs = buildHistoryParseJobs(BUSINESS_DATA, [
      {
        metadata: { phase: 0, chunk_order: 1, progress: 100 },
        threads: [{ context: { user_id: 'US.1' }, messages: [buildMessage('15550783881')] }],
      },
    ]);

    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.payload.contacts).toEqual({ wa_id: undefined, user_id: 'US.1', profile: { name: '' } });
  });

  it('should skip threads without any customer identifier', () => {
    const jobs = buildHistoryParseJobs(BUSINESS_DATA, [
      {
        metadata: { phase: 0, chunk_order: 1, progress: 100 },
        threads: [{ messages: [buildMessage('15550783881')] }],
      },
    ]);

    expect(jobs).toHaveLength(0);
  });
});
