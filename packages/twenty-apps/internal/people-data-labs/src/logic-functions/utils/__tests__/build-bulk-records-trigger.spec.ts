import { describe, expect, it } from 'vitest';

import { buildBulkRecordsTrigger } from 'src/logic-functions/utils/build-bulk-records-trigger';

describe('buildBulkRecordsTrigger', () => {
  it('builds a bulk-records manual trigger pointing at the next step', () => {
    const trigger = buildBulkRecordsTrigger({
      objectNameSingular: 'person',
      name: 'When people are selected',
      icon: 'IconSparkles',
      nextStepId: 'step-1',
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
      nextStepIds: ['step-1'],
    });
  });
});
