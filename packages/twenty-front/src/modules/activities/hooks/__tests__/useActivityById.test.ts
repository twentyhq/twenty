import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useActivityById } from '../useActivityById';

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: jest.fn(() => ({
    record: {
      activity: {
        id: 'test-activity-id',
        name: 'Test Activity',
        description: 'This is a test activity',
      },
    },
    loading: false,
  })),
}));

describe('useActivityById', () => {
  it('fetches activity by id and returns the activity and loading state', async () => {
    const activityId = 'test-activity-id';
    const { result } = renderHook(() => useActivityById({ activityId }), {
      wrapper: RecoilRoot,
    });

    expect(result.current.loading).toBe(false);

    expect(result.current.activity).toEqual({
      activity: {
        id: 'test-activity-id',
        name: 'Test Activity',
        description: 'This is a test activity',
      },
      activityTargets: [],
      comments: [],
    });
  });
});
