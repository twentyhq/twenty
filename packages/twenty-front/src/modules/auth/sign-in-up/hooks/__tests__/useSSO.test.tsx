import { GET_AUTHORIZATION_URL_FOR_SSO } from '@/auth/graphql/mutations/getAuthorizationUrlForSSO';
import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: vi.fn(),
}));
vi.mock('@/domain-manager/hooks/useRedirect', () => ({
  useRedirect: vi.fn(),
}));
vi.mock('~/generated/graphql');

const mockEnqueueErrorSnackBar = vi.fn();
const mockRedirect = vi.fn();

vi.mocked(useSnackBar).mockReturnValue({
  handleSnackBarClose: vi.fn(),
  enqueueSuccessSnackBar: vi.fn(),
  enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
  enqueueInfoSnackBar: vi.fn(),
  enqueueWarningSnackBar: vi.fn(),
});
vi.mocked(useRedirect).mockReturnValue({
  redirect: Object.assign(mockRedirect, {
    cancel: vi.fn(),
    flush: vi.fn(),
    isPending: vi.fn().mockReturnValue(false),
  }),
});

const apolloMocks = [
  {
    request: {
      query: GET_AUTHORIZATION_URL_FOR_SSO,
      variables: {
        input: {
          identityProviderId: 'success-id',
        },
      },
    },
    result: {
      data: {
        getAuthorizationUrlForSSO: { authorizationURL: 'http://example.com' },
      },
    },
  },
  {
    request: {
      query: GET_AUTHORIZATION_URL_FOR_SSO,
      variables: {
        input: {
          identityProviderId: 'error-id',
        },
      },
    },
    result: {
      data: null,
      errors: [{ message: 'Error message' }],
    },
  },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <MockedProvider mocks={apolloMocks} addTypename={false}>
      {children}
    </MockedProvider>
  </MemoryRouter>
);

describe('useSSO', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call getAuthorizationUrlForSSO with correct parameters', async () => {
    const { result } = renderHook(() => useSSO(), {
      wrapper: Wrapper,
    });
    const identityProviderId = 'success-id';

    await result.current.redirectToSSOLoginPage(identityProviderId);

    expect(mockRedirect).toHaveBeenCalledWith('http://example.com');
  });

  it('should enqueue error snackbar when URL retrieval fails', async () => {
    const { result } = renderHook(() => useSSO(), {
      wrapper: Wrapper,
    });
    const identityProviderId = 'error-id';

    await result.current.redirectToSSOLoginPage(identityProviderId);

    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
      apolloError: new ApolloError({
        graphQLErrors: [{ message: 'Error message' }],
      }),
    });
  });
});
