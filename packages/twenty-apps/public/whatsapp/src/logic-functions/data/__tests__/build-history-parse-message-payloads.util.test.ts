import { describe, expect, it } from 'vitest';
import { buildHistoryParseMessagePayloads } from 'src/logic-functions/data/build-history-parse-message-payloads.util';

const BUSINESS_DATA = { display_phone_number: '15550783881', phone_number_id: 'phone-number-id' };

const buildMessage = (from: string) => ({
  from,
  id: `wamid.${from}`,
  timestamp: '1700000000',
  type: 'text' as const,
  text: { body: 'Hello' },
  history_context: { status: 'READ' as const },
});

const buildPayloads = (threads: Parameters<typeof buildHistoryParseMessagePayloads>[0]['chunks']) =>
  buildHistoryParseMessagePayloads({
    whatsAppBusinessAccountId: 'waba-id',
    businessData: BUSINESS_DATA,
    chunks: threads,
  });

const METADATA = { phase: 0 as const, chunk_order: 1, progress: 100 };

describe('buildHistoryParseMessagePayloads', () => {
  it('should fall back to the thread context phone number when the thread id is omitted', () => {
    const payloads = buildPayloads([
      { metadata: METADATA, threads: [{ context: { wa_id: '16505551234' }, messages: [buildMessage('15550783881')] }] },
    ]);

    expect(payloads).toHaveLength(1);
    expect(payloads[0]?.whatsAppBusinessAccountId).toBe('waba-id');
    expect(payloads[0]?.contacts?.wa_id).toBe('16505551234');
  });

  it('should keep threads of users who hide their phone number, keyed by their user ID', () => {
    const payloads = buildPayloads([
      { metadata: METADATA, threads: [{ context: { user_id: 'US.1' }, messages: [buildMessage('15550783881')] }] },
    ]);

    expect(payloads[0]?.contacts).toEqual({ wa_id: undefined, user_id: 'US.1', profile: { name: '' } });
  });

  it('should skip threads without any customer identifier', () => {
    expect(buildPayloads([{ metadata: METADATA, threads: [{ messages: [buildMessage('15550783881')] }] }])).toHaveLength(0);
  });
});
