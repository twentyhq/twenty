import { ApolloError, gql } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';

enableFetchMocks();

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const initialRouter = jest.requireActual('react-router-dom');

  return {
    ...initialRouter,
    useNavigate: () => mockNavigate,
  };
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <MemoryRouter
      initialEntries={['/welcome', '/verify', '/opportunities']}
      initialIndex={2}
    >
      <SnackBarComponentInstanceContext.Provider
        value={{ instanceId: 'test-instance-id' }}
      >
        {children}
      </SnackBarComponentInstanceContext.Provider>
    </MemoryRouter>
  </RecoilRoot>
);

describe('useApolloFactory', () => {
  it('should work as expected', () => {
    const { result } = renderHook(() => useApolloFactory(), {
      wrapper: Wrapper,
    });

    const res = result.current;

    expect(res).toBeDefined();
    expect(res).toHaveProperty('link');
    expect(res).toHaveProperty('cache');
    expect(res).toHaveProperty('query');
  });

  it('should navigate to /welcome on unauthenticated error', async () => {
    const errors = [
      {
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      },
    ];
    fetchMock.mockResponse(() =>
      Promise.resolve({
        body: JSON.stringify({
          data: {},
          errors,
        }),
      }),
    );

    const { result } = renderHook(
      () => {
        const location = useLocation();
        return { factory: useApolloFactory(), location };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.location.pathname).toBe('/opportunities');

    try {
      await act(async () => {
        await result.current.factory.mutate({
          mutation: gql`
            mutation Track($type: String!, $sessionId: String!, $data: JSON!) {
              track(type: $type, sessionId: $sessionId, data: $data) {
                success
              }
            }
          `,
        });
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ApolloError);
      expect((error as ApolloError).message).toBe('Error message not found.');

      expect(mockNavigate).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/welcome');
    }
  });
});
