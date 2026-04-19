import { GET_AUTHORIZATION_URL_FOR_Sso } from '@/auth/graphql/mutations/getAuthorizationUrlForSso';
import { useSso } from '@/auth/sign-in-up/hooks/useSso';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { MockedProvider } from '@apollo/client/testing/react';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar');
jest.mock('@/domain-manager/hooks/useRedirect');
jest.mock('~/generated/graphql');

const mockEnqueueErrorSnackBar = jest.fn();
const mockRedirect = jest.fn();

(useSnackBar as jest.Mock).mockReturnValue({
  enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
});
(useRedirect as jest.Mock).mockReturnValue({
  redirect: mockRedirect,
});

const apolloMocks = [
  {
    request: {
      query: GET_AUTHORIZATION_URL_FOR_Sso,
      variables: {
        input: {
          identityProviderId: 'success-id',
        },
      },
    },
    result: {
      data: {
        getAuthorizationUrlForSso: { authorizationURL: 'http://example.com' },
      },
    },
  },
  {
    request: {
      query: GET_AUTHORIZATION_URL_FOR_Sso,
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
    <MockedProvider mocks={apolloMocks}>{children}</MockedProvider>
  </MemoryRouter>
);

describe('useSso', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getAuthorizationUrlForSso with correct parameters', async () => {
    const { result } = renderHook(() => useSso(), {
      wrapper: Wrapper,
    });
    const identityProviderId = 'success-id';

    await result.current.redirectToSsoLoginPage(identityProviderId);

    expect(mockRedirect).toHaveBeenCalledWith('http://example.com');
  });

  it('should enqueue error snackbar when URL retrieval fails', async () => {
    const { result } = renderHook(() => useSso(), {
      wrapper: Wrapper,
    });
    const identityProviderId = 'error-id';

    await result.current.redirectToSsoLoginPage(identityProviderId);

    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
      apolloError: new CombinedGraphQLErrors({
        errors: [{ message: 'Error message' }],
      }),
    });
  });
});
