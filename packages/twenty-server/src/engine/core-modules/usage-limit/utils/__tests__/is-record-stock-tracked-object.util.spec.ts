import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { isRecordStockTrackedObject } from 'src/engine/core-modules/usage-limit/utils/is-record-stock-tracked-object.util';

describe('isRecordStockTrackedObject', () => {
  it('leaves timeline activities out of the record stock', () => {
    expect(
      isRecordStockTrackedObject({
        universalIdentifier:
          STANDARD_OBJECTS.timelineActivity.universalIdentifier,
      }),
    ).toBe(false);
  });

  it('tracks every other object', () => {
    expect(
      isRecordStockTrackedObject({
        universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
      }),
    ).toBe(true);
    expect(
      isRecordStockTrackedObject({ universalIdentifier: 'custom-object' }),
    ).toBe(true);
  });
});
