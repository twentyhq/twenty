import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useCurrentUserTaskCount } from '@/activities/tasks/hooks/useCurrentUserDueTaskCount';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { mockedActivities } from '~/testing/mock-data/activities';

const useFindManyRecordsMock = jest.fn(() => ({
  records: [...mockedActivities, { id: '2' }],
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));

(useFindManyRecords as jest.Mock).mockImplementation(useFindManyRecordsMock);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('useCurrentUserTaskCount', () => {
  it('should return the current user task count', async () => {
    const { result } = renderHook(() => useCurrentUserTaskCount(), {
      wrapper: Wrapper,
    });

    expect(result.current.currentUserDueTaskCount).toBe(1);
  });
});
