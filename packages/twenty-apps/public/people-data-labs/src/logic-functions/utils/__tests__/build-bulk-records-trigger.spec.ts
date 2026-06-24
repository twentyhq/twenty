import { describe, expect, it } from 'vitest';

import { buildBulkRecordsTrigger } from 'src/logic-functions/utils/build-bulk-records-trigger';

describe('buildBulkRecordsTrigger', () => {
  it('builds a bulk-records manual trigger with no next step wired', () => {
    const trigger = buildBulkRecordsTrigger({
      objectNameSingular: 'person',
      name: 'When people are selected',
      icon: 'IconSparkles',
    });

    expect(trigger).toEqual({
      name: 'When people are selected',
      type: 'MANUAL',
      settings: {
        objectType: 'person',
        availability: { type: 'BULK_RECORDS', objectNameSingular: 'person' },
        outputSchema: {},
        icon: 'IconSparkles',
        isPinned: false,
      },
      nextStepIds: [],
    });
  });
});
