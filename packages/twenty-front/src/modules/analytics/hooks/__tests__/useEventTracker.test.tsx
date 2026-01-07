import { gql } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { expect } from '@storybook/test';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import {
  ANALYTICS_COOKIE_NAME,
  useEventTracker,
} from '@/analytics/hooks/useEventTracker';
import { AnalyticsType } from '~/generated/graphql';

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: `${ANALYTICS_COOKIE_NAME}=exampleId`,
});

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        mutation TrackAnalytics(
          $type: AnalyticsType!
          $event: String
          $name: String
          $properties: JSON
        ) {
          trackAnalytics(
            type: $type
            event: $event
            name: $name
            properties: $properties
          ) {
            success
          }
        }
      `,
      variables: {
        type: AnalyticsType['TRACK'],
        event: 'Example Event',
        properties: {
          foo: 'bar',
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
  {
    request: {
      query: gql`
        mutation TrackAnalytics(
          $type: AnalyticsType!
          $event: String
          $name: String
          $properties: JSON
        ) {
          trackAnalytics(
            type: $type
            event: $event
            name: $name
            properties: $properties
          ) {
            success
          }
        }
      `,
      variables: {
        type: AnalyticsType['PAGEVIEW'],
        name: 'Example',
        properties: {
          sessionId: 'exampleId',
          pathname: '/example/path',
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
    const payload = {
      event: 'Example Event',
      properties: {
        foo: 'bar',
      },
    };

    const { result } = renderHook(() => useEventTracker(), {
      wrapper: Wrapper,
    });
    act(() => {
      result.current(AnalyticsType['TRACK'], payload);
    });
    await waitFor(() => {
      expect(mocks[0].result).toHaveBeenCalled();
    });
  });

  it('should make the call to track a pageview', async () => {
    const payload = {
      name: 'Example',
      properties: {
        sessionId: 'exampleId',
        pathname: '/example/path',
        userAgent: '',
        timeZone: '',
        locale: '',
        href: '',
        referrer: '',
      },
    };
    const { result } = renderHook(() => useEventTracker(), {
      wrapper: Wrapper,
    });
    act(() => {
      result.current(AnalyticsType['PAGEVIEW'], payload);
    });
    await waitFor(() => {
      expect(mocks[1].result).toHaveBeenCalled();
    });
  });
});
