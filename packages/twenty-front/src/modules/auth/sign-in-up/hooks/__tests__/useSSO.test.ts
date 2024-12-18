import { renderHook } from '@testing-library/react';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useGetAuthorizationUrlMutation } from '~/generated/graphql';
import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';

// Mock dependencies
jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar');
jest.mock('~/generated/graphql');

// Helpers
const mockEnqueueSnackBar = jest.fn();
const mockGetAuthorizationUrlMutation = jest.fn();

// Mock return values
(useSnackBar as jest.Mock).mockReturnValue({
  enqueueSnackBar: mockEnqueueSnackBar,
});
(useGetAuthorizationUrlMutation as jest.Mock).mockReturnValue([
  mockGetAuthorizationUrlMutation,
]);

describe('useSSO', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getAuthorizationUrlForSSO with correct parameters', async () => {
    const { result } = renderHook(() => useSSO());
    const identityProviderId = 'test-id';

    mockGetAuthorizationUrlMutation.mockResolvedValueOnce({
      data: {
        getAuthorizationUrl: {
          authorizationURL: 'http://example.com',
        },
      },
    });

    await result.current.getAuthorizationUrlForSSO({ identityProviderId });

    expect(mockGetAuthorizationUrlMutation).toHaveBeenCalledWith({
      variables: { input: { identityProviderId } },
    });
  });

  it('should enqueue error snackbar when URL retrieval fails', async () => {
    const { result } = renderHook(() => useSSO());
    const identityProviderId = 'test-id';

    mockGetAuthorizationUrlMutation.mockResolvedValueOnce({
      errors: [{ message: 'Error message' }],
    });

    await result.current.redirectToSSOLoginPage(identityProviderId);

    expect(mockEnqueueSnackBar).toHaveBeenCalledWith('Error message', {
      variant: 'error',
    });
  });

  it('should enqueue default error snackbar when error message is not provided', async () => {
    const { result } = renderHook(() => useSSO());
    const identityProviderId = 'test-id';

    mockGetAuthorizationUrlMutation.mockResolvedValueOnce({ errors: [{}] });

    await result.current.redirectToSSOLoginPage(identityProviderId);

    expect(mockEnqueueSnackBar).toHaveBeenCalledWith('Unknown error', {
      variant: 'error',
    });
  });
});
