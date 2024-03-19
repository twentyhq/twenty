import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import pick from 'lodash.pick';
import { RecoilRoot } from 'recoil';

import { useDeleteActivityFromCache } from '@/activities/hooks/useDeleteActivityFromCache';
import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { mockedActivities } from '~/testing/mock-data/activities';

const triggerDeleteRecordsOptimisticEffectMock = jest.fn();

// mock the triggerDeleteRecordsOptimisticEffect function
jest.mock(
  '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect',
  () => ({
    triggerDeleteRecordsOptimisticEffect: jest.fn(),
  }),
);

(triggerDeleteRecordsOptimisticEffect as jest.Mock).mockImplementation(
  triggerDeleteRecordsOptimisticEffectMock,
);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>{children}</MockedProvider>
  </RecoilRoot>
);

describe('useDeleteActivityFromCache', () => {
  it('works as expected', () => {
    const { result } = renderHook(() => useDeleteActivityFromCache(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.deleteActivityFromCache(
        pick(mockedActivities[0], [
          'id',
          'title',
          'body',
          'type',
          'completedAt',
          'dueAt',
          'updatedAt',
        ]),
      );

      expect(triggerDeleteRecordsOptimisticEffectMock).toHaveBeenCalledTimes(1);
    });
  });
});
