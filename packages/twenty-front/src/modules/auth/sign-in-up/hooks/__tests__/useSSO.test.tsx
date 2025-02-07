import { GET_AUTHORIZATION_URL } from '@/auth/graphql/mutations/getAuthorizationUrl';
import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { renderHook } from '@testing-library/react';

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar');
jest.mock('@/domain-manager/hooks/useRedirect');
jest.mock('~/generated/graphql');

const mockEnqueueSnackBar = jest.fn();
const mockRedirect = jest.fn();

(useSnackBar as jest.Mock).mockReturnValue({
  enqueueSnackBar: mockEnqueueSnackBar,
});
(useRedirect as jest.Mock).mockReturnValue({
  redirect: mockRedirect,
});

const apolloMocks = [
  {
    request: {
      query: GET_AUTHORIZATION_URL,
      variables: {
        input: {
          identityProviderId: 'success-id',
        },
      },
    },
    result: {
      data: {
        getAuthorizationUrl: { authorizationURL: 'http://example.com' },
      },
    },
  },
  {
    request: {
      query: GET_AUTHORIZATION_URL,
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

    expect(mockEnqueueSnackBar).toHaveBeenCalledWith('Error message', {
      variant: 'error',
    });
  });
});
