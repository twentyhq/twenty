import { GET_AUTHORIZATION_URL_FOR_SSO } from '@/auth/graphql/mutations/getAuthorizationUrlForSSO';
import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
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
    jest.clearAllMocks();
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
