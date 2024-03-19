import { renderHook } from '@testing-library/react';

import { useInjectIntoActivityTargetInlineCellCache } from '@/activities/inline-cell/hooks/useInjectIntoActivityTargetInlineCellCache';
import { Activity } from '@/activities/types/Activity';

jest.mock('@/object-metadata/hooks/useObjectMetadataItemOnly', () => ({
  useObjectMetadataItemOnly: jest.fn(() => ({
    objectMetadataItem: { exampleMetadataItem: 'example' },
  })),
}));

jest.mock(
  '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache',
  () => ({
    useUpsertFindManyRecordsQueryInCache: jest.fn(() => ({
      upsertFindManyRecordsQueryInCache: jest.fn(),
    })),
  }),
);

describe('useInjectIntoActivityTargetInlineCellCache', () => {
  it('should inject into activity target inline cell cache as expected', () => {
    const { result } = renderHook(() =>
      useInjectIntoActivityTargetInlineCellCache(),
    );

    const { injectIntoActivityTargetInlineCellCache } = result.current;

    const mockActivityId = 'mockId';
    const mockActivityTargetsToInject = [
      {
        id: '1',
        name: 'Example Activity Target',
        createdAt: '2022-01-01',
        updatedAt: '2022-01-01',
        activity: {
          id: '1',
          createdAt: '2022-01-01',
          updatedAt: '2022-01-01',
        } as Pick<Activity, 'id' | 'createdAt' | 'updatedAt'>,
      },
    ];
    injectIntoActivityTargetInlineCellCache({
      activityId: mockActivityId,
      activityTargetsToInject: mockActivityTargetsToInject,
    });

    expect(
      result.current.injectIntoActivityTargetInlineCellCache,
    ).toBeDefined();
  });
});
