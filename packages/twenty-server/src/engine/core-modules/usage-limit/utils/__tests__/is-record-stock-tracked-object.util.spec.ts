import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { isRecordStockTrackedObject } from 'src/engine/core-modules/usage-limit/utils/is-record-stock-tracked-object.util';

describe('isRecordStockTrackedObject', () => {
  it('tracks every non-system object', () => {
    expect(
      isRecordStockTrackedObject({
        isSystem: false,
        universalIdentifier: 'custom-object',
      }),
    ).toBe(true);
  });

  it('leaves system objects out of the record stock', () => {
    expect(
      isRecordStockTrackedObject({
        isSystem: true,
        universalIdentifier:
          STANDARD_OBJECTS.timelineActivity.universalIdentifier,
      }),
    ).toBe(false);
  });

  it.each([
    ['message', STANDARD_OBJECTS.message.universalIdentifier],
    ['calendarEvent', STANDARD_OBJECTS.calendarEvent.universalIdentifier],
  ])('still tracks the %s system object', (_, universalIdentifier) => {
    expect(
      isRecordStockTrackedObject({ isSystem: true, universalIdentifier }),
    ).toBe(true);
  });
});
