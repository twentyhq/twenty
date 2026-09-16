import { gql } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { act, renderHook } from '@testing-library/react';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';
import { clearSessionGeneration } from '@/auth/utils/clearSessionGeneration';
import { getSessionGeneration } from '@/auth/utils/getSessionGeneration';
import { rotateSessionGeneration } from '@/auth/utils/rotateSessionGeneration';
import { AppPath } from 'twenty-shared/types';

enableFetchMocks();

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const initialRouter = jest.requireActual('react-router-dom');

  return {
    ...initialRouter,
    useNavigate: () => mockNavigate,
  };
});

const BILLING_PLAN_REQUIRED_RESPONSE = JSON.stringify({
  data: {},
  errors: [
    {
      message: 'Workspace subscription is required',
      extensions: {
        code: 'FORBIDDEN',
        subCode: 'BILLING_PLAN_REQUIRED',
      },
    },
  ],
});

const createWrapper =
  (initialEntries: string[], initialIndex = 0) =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <SnackBarComponentInstanceContext.Provider
        value={{ instanceId: 'test-instance-id' }}
      >
        {children}
      </SnackBarComponentInstanceContext.Provider>
    </MemoryRouter>
  );

const Wrapper = createWrapper(['/welcome', '/verify', '/opportunities'], 2);

const mutateTrack = async (factory: ReturnType<typeof useApolloFactory>) => {
  await factory.mutate({
    mutation: gql`
      mutation Track($type: String!, $sessionId: String!, $data: JSON!) {
        track(type: $type, sessionId: $sessionId, data: $data) {
          success
        }
      }
    `,
  });
};

describe('useApolloFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    clearSessionGeneration();
  });

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
    expect.assertions(6);

    rotateSessionGeneration();

    expect(getSessionGeneration()).not.toBeNull();

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
        return {
          factory: useApolloFactory(),
          location,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.location.pathname).toBe('/opportunities');

    let mutationError: unknown;

    try {
      await act(async () => {
        await mutateTrack(result.current.factory);
      });
    } catch (error) {
      mutationError = error;
    }

    expect(mutationError).toBeInstanceOf(CombinedGraphQLErrors);
    expect(getSessionGeneration()).toBeNull();
    expect(mockNavigate).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/welcome');
  });

  it('should navigate to /plan-required on BILLING_PLAN_REQUIRED', async () => {
    fetchMock.mockResponse(BILLING_PLAN_REQUIRED_RESPONSE);

    const { result } = renderHook(() => useApolloFactory(), {
      wrapper: createWrapper(['/objects/companies']),
    });

    let mutationError: unknown;

    try {
      await act(async () => {
        await mutateTrack(result.current);
      });
    } catch (error) {
      mutationError = error;
    }

    expect(mutationError).toBeInstanceOf(CombinedGraphQLErrors);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(AppPath.PlanRequired, {
      replace: true,
    });
  });

  it('should not navigate when already on plan-required path', async () => {
    fetchMock.mockResponse(BILLING_PLAN_REQUIRED_RESPONSE);

    const { result } = renderHook(() => useApolloFactory(), {
      wrapper: createWrapper([AppPath.PlanRequired]),
    });

    let mutationError: unknown;

    try {
      await act(async () => {
        await mutateTrack(result.current);
      });
    } catch (error) {
      mutationError = error;
    }

    expect(mutationError).toBeInstanceOf(CombinedGraphQLErrors);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
