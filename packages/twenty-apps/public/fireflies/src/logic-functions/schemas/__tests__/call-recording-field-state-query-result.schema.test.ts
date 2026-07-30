import { describe, expect, it } from 'vitest';

import { callRecordingFieldStateQueryResultSchema } from 'src/logic-functions/schemas/call-recording-field-state-query-result.schema';

describe('callRecordingFieldStateQueryResultSchema', () => {
  it('accepts the queried call recording field state', () => {
    expect(
      callRecordingFieldStateQueryResultSchema.safeParse({
        callRecordings: {
          edges: [
            {
              node: {
                id: 'call-recording-id',
                summary: { markdown: 'Imported summary' },
              },
            },
          ],
        },
      }).success,
    ).toBe(true);
  });

  it('rejects a call recording without an id', () => {
    expect(
      callRecordingFieldStateQueryResultSchema.safeParse({
        callRecordings: {
          edges: [{ node: { summary: null } }],
        },
      }).success,
    ).toBe(false);
  });
});
