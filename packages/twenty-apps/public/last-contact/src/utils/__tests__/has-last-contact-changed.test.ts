import { describe, expect, it } from 'vitest';

import { hasLastContactChanged } from 'src/utils/has-last-contact-changed';

const MESSAGE_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_MESSAGE_ID = '22222222-2222-2222-2222-222222222222';
const OCCURRED_AT = '2026-06-10T09:00:00.000Z';

describe('hasLastContactChanged', () => {
  it('detects a change in a field other than lastContactAt', () => {
    expect(
      hasLastContactChanged(
        { lastContactAt: OCCURRED_AT, lastEmailId: OTHER_MESSAGE_ID },
        { lastContactAt: OCCURRED_AT, lastEmailId: MESSAGE_ID },
      ),
    ).toBe(true);
  });

  it.each(['lastContactAt', 'lastOutboundAt', 'lastInboundAt'])(
    'treats the same instant written differently as unchanged in %s',
    (fieldName) => {
      expect(
        hasLastContactChanged(
          { [fieldName]: '2026-06-10T09:00:00Z' },
          { [fieldName]: OCCURRED_AT },
        ),
      ).toBe(false);
    },
  );

  it('detects a different instant', () => {
    expect(
      hasLastContactChanged(
        { lastInboundAt: OCCURRED_AT },
        { lastInboundAt: '2026-06-11T09:00:00.000Z' },
      ),
    ).toBe(true);
  });

  it('treats a missing stored value as empty', () => {
    expect(
      hasLastContactChanged({}, { lastContactAt: null, lastEmailId: null }),
    ).toBe(false);
  });
});
