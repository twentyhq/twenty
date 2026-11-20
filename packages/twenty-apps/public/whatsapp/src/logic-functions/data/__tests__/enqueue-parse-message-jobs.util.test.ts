import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enqueueJobs } from 'twenty-sdk/logic-function';
import { enqueueParseMessageJobs } from 'src/logic-functions/data/enqueue-parse-message-jobs.util';
import { type ParseMessagePayload } from 'src/logic-functions/types/parse-message-payload.type';

vi.mock('twenty-sdk/logic-function', () => ({ enqueueJobs: vi.fn() }));

const buildPayload = (index: number): ParseMessagePayload => ({
  whatsAppBusinessAccountId: 'waba-id',
  businessData: { display_phone_number: '15550783881', phone_number_id: 'phone-number-id' },
  messages: { from: '16505551234', id: `wamid.${index}`, timestamp: '1700000000', type: 'text', text: { body: 'Hi' } },
});

describe('enqueueParseMessageJobs', () => {
  beforeEach(() => {
    vi.mocked(enqueueJobs).mockReset();
  });

  it('should enqueue at most 200 jobs per call', async () => {
    await enqueueParseMessageJobs(Array.from({ length: 450 }, (_, index) => buildPayload(index)));

    expect(vi.mocked(enqueueJobs).mock.calls.map(([input]) => input.jobs?.length)).toEqual([200, 200, 50]);
  });

  it('should not call enqueueJobs without payloads', async () => {
    await enqueueParseMessageJobs([]);

    expect(enqueueJobs).not.toHaveBeenCalled();
  });
});
