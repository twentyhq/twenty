import { InMemoryCache } from '@apollo/client';
import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { type FrontComponentMediaSessionHost } from 'twenty-front-component-renderer';

import { useFrontComponentMediaSession } from '@/front-components/media-session/hooks/useFrontComponentMediaSession';
import { FindFrontComponentApplicationCapabilitiesDocument } from '~/generated-metadata/graphql';

jest.mock('@quilted/threads', () => ({}));
jest.mock('@/ui/layout/dialog/hooks/useDialog', () => ({
  useDialog: () => ({ openDialog: jest.fn(), closeDialog: jest.fn() }),
}));

const FRONT_COMPONENT_ID = 'front-component-id';
const CAPABILITY_QUERY = {
  query: FindFrontComponentApplicationCapabilitiesDocument,
  variables: { id: FRONT_COMPONENT_ID },
};

describe('useFrontComponentMediaSession', () => {
  const getUserMedia = jest.fn();
  const hosts: FrontComponentMediaSessionHost[] = [];

  beforeEach(() => {
    getUserMedia.mockReset();
    getUserMedia.mockImplementation(async () => ({
      getTracks: () => [
        {
          id: 'audio-track',
          kind: 'audio',
          readyState: 'live',
          stop: jest.fn(),
          addEventListener: jest.fn(),
        },
      ],
    }));
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });
  });

  afterEach(() => {
    act(() => {
      for (const host of hosts) {
        host.stopAllSessions();
      }
    });
    hosts.splice(0);
  });

  const renderMediaSession = (serverCapabilities: string[] = []) => {
    const cache = new InMemoryCache();
    cache.writeQuery({
      ...CAPABILITY_QUERY,
      data: {
        frontComponent: {
          __typename: 'FrontComponent',
          id: FRONT_COMPONENT_ID,
          applicationGrantedCapabilities: [],
        },
      },
    });
    const mocks: MockedResponse[] = [
      {
        request: CAPABILITY_QUERY,
        result: {
          data: {
            frontComponent: {
              __typename: 'FrontComponent',
              id: FRONT_COMPONENT_ID,
              applicationGrantedCapabilities: serverCapabilities,
            },
          },
        },
      },
    ];
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MockedProvider cache={cache} mocks={mocks}>
        {children}
      </MockedProvider>
    );
    const { result } = renderHook(
      () =>
        useFrontComponentMediaSession({ frontComponentId: FRONT_COMPONENT_ID }),
      { wrapper },
    );
    hosts.push(result.current.mediaSessionHost);

    return { result, cache };
  };

  it('resumes after approval and remembers access for subsequent captures', async () => {
    const { result, cache } = renderMediaSession();
    const host = result.current.mediaSessionHost;
    let pendingStart: ReturnType<typeof host.mediaStartStream>;
    act(() => {
      pendingStart = host.mediaStartStream({ audio: true, video: false });
    });

    await waitFor(() =>
      expect(result.current.permissionRequest).not.toBeNull(),
    );
    expect(getUserMedia).not.toHaveBeenCalled();

    await act(async () => {
      result.current.permissionRequest?.resolve(['microphone']);
      await expect(pendingStart).resolves.toMatchObject({ status: 'started' });
    });

    expect(
      cache.readQuery(CAPABILITY_QUERY)?.frontComponent
        ?.applicationGrantedCapabilities,
    ).toEqual(['microphone']);
    expect(result.current.permissionRequest).toBeNull();
    act(() => host.stopAllSessions());
    await act(async () => {
      await expect(
        host.mediaStartStream({ audio: true, video: false }),
      ).resolves.toMatchObject({ status: 'started' });
    });
    expect(getUserMedia).toHaveBeenCalledTimes(2);
  });

  it('uses workspace approval from another session without prompting again', async () => {
    const { result } = renderMediaSession(['microphone']);

    await act(async () => {
      await expect(
        result.current.mediaSessionHost.mediaStartStream({
          audio: true,
          video: false,
        }),
      ).resolves.toMatchObject({ status: 'started' });
    });

    expect(result.current.permissionRequest).toBeNull();
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('does not reach browser capture when approval is cancelled', async () => {
    const { result } = renderMediaSession();
    const host = result.current.mediaSessionHost;
    let pendingStart: ReturnType<typeof host.mediaStartStream>;
    act(() => {
      pendingStart = host.mediaStartStream({ audio: true, video: false });
    });

    await waitFor(() =>
      expect(result.current.permissionRequest).not.toBeNull(),
    );
    await act(async () => {
      result.current.permissionRequest?.resolve(null);
      await expect(pendingStart).resolves.toMatchObject({
        status: 'failed',
        errorName: 'NotAllowedError',
      });
    });

    expect(getUserMedia).not.toHaveBeenCalled();
    expect(result.current.permissionRequest).toBeNull();
  });
});
