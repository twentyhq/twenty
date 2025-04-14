import { gql } from '@apollo/client';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { expect } from '@storybook/test';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { useEventTracker } from '../useEventTracker';

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        mutation Track($type: String!, $event: String, $name: String, $properties: JSON!) {
          track(type: $type, event: $event, name: $name, properties: $properties) {
            success
          }
        }
      `,
      variables: {
        type: 'track',
        event: 'exampleType',
        name: undefined,
        properties: {
          sessionId: 'exampleId',
          pathname: '',
          userAgent: '',
          timeZone: '',
          locale: '',
          href: '',
          referrer: '',
        },
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
    const eventData = {
      sessionId: 'exampleId',
      pathname: '',
      userAgent: '',
      timeZone: '',
      locale: '',
      href: '',
      referrer: '',
    };
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
