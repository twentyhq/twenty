import { GET_AUTHORIZATION_URL_FOR_SSO } from '@/auth/graphql/mutations/getAuthorizationUrlForSSO';
import { useSso } from '@/auth/sign-in-up/hooks/useSso';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';

import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { MockedProvider } from '@apollo/client/testing/react';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockEnqueueToast = jest.fn();
const mockEnqueueErrorToast = jest.fn();

jest.mock('twenty-ui/feedback', () => ({
  ...jest.requireActual('twenty-ui/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));
jest.mock('@/error-handler/hooks/useErrorToast', () => ({
  useErrorToast: () => ({ enqueueErrorToast: mockEnqueueErrorToast }),
}));
jest.mock('@/domain-manager/hooks/useRedirect');
jest.mock('~/generated/graphql');

const mockRedirect = jest.fn();

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
    <MockedProvider mocks={apolloMocks}>{children}</MockedProvider>
  </MemoryRouter>
);

describe('useSso', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getAuthorizationUrlForSSO with correct parameters', async () => {
    const { result } = renderHook(() => useSso(), {
      wrapper: Wrapper,
    });
    const identityProviderId = 'success-id';

    await result.current.redirectToSsoLoginPage(identityProviderId);

    expect(mockRedirect).toHaveBeenCalledWith('http://example.com');
  });

  it('should enqueue error toast when URL retrieval fails', async () => {
    const { result } = renderHook(() => useSso(), {
      wrapper: Wrapper,
    });
    const identityProviderId = 'error-id';

    await result.current.redirectToSsoLoginPage(identityProviderId);

    expect(mockEnqueueErrorToast).toHaveBeenCalledWith(
      new CombinedGraphQLErrors({
        errors: [{ message: 'Error message' }],
      }),
    );
  });
});
