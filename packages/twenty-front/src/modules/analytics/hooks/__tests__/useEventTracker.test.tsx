import { ReactNode } from 'react';
import { gql } from '@apollo/client';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { expect } from '@storybook/test';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useEventTracker } from '../useEventTracker';

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        mutation Track($type: String!, $data: JSON!) {
          track(type: $type, data: $data) {
            success
          }
        }
      `,
      variables: {
        type: 'exampleType',
        data: { location: { pathname: '/examplePath' } },
      },
    },
    result: jest.fn(() => ({
      data: {
        track: {
          success: true,
        },
      },
    })),
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  </RecoilRoot>
);

describe('useEventTracker', () => {
  it('should make the call to track the event', async () => {
    const eventType = 'exampleType';
    const eventData = { location: { pathname: '/examplePath' } };
    const { result } = renderHook(() => useEventTracker(), {
      wrapper: Wrapper,
    });
    act(() => {
      result.current(eventType, eventData);
    });
    await waitFor(() => {
      expect(mocks[0].result).toHaveBeenCalled();
    });
  });
});
