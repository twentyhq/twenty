import { MicrosoftOAuthGuard } from 'src/engine/core-modules/auth/guards/microsoft-oauth.guard';

const AADSTS650051_ERROR = new Error(
  'AADSTS650051: The application needs to be provisioned for this tenant.',
);

const createMockContext = () => {
  const redirect = jest.fn();

  return {
    redirect,
    context: {
      switchToHttp: () => ({
        getResponse: () => ({ redirect }),
      }),
    },
  };
};

const createMockRequest = (query: Record<string, string | undefined> = {}) =>
  ({ query }) as any;

const callHandler = (
  guard: MicrosoftOAuthGuard,
  context: any,
  request: any,
  error: unknown,
): boolean => {
  return (guard as any).handleTransientMicrosoftOAuthError(
    context,
    request,
    error,
  );
};

describe('MicrosoftOAuthGuard', () => {
  let guard: MicrosoftOAuthGuard;

  beforeEach(() => {
    guard = new (MicrosoftOAuthGuard as any)(null, null, null);
  });

  describe('handleTransientMicrosoftOAuthError', () => {
    it('should redirect to /auth/microsoft on first AADSTS650051', () => {
      const { context, redirect } = createMockContext();
      const request = createMockRequest({
        state: JSON.stringify({ workspaceId: 'ws-123', locale: 'en' }),
      });

      const result = callHandler(guard, context, request, AADSTS650051_ERROR);

      expect(result).toBe(true);
      expect(redirect).toHaveBeenCalledWith(
        expect.stringContaining('/auth/microsoft?'),
      );

      const redirectUrl = redirect.mock.calls[0][0];

      expect(redirectUrl).toContain('oauthRetryCount=1');
      expect(redirectUrl).toContain('workspaceId=ws-123');
      expect(redirectUrl).toContain('locale=en');
    });

    it('should not redirect when retry count is exhausted', () => {
      const { context, redirect } = createMockContext();
      const request = createMockRequest({
        state: JSON.stringify({ oauthRetryCount: 1 }),
      });

      const result = callHandler(guard, context, request, AADSTS650051_ERROR);

      expect(result).toBe(false);
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should not redirect for non-transient errors', () => {
      const { context, redirect } = createMockContext();
      const request = createMockRequest();

      const result = callHandler(
        guard,
        context,
        request,
        new Error('invalid_client'),
      );

      expect(result).toBe(false);
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should handle missing state without crashing', () => {
      const { context, redirect } = createMockContext();
      const request = createMockRequest();

      const result = callHandler(guard, context, request, AADSTS650051_ERROR);

      expect(result).toBe(true);
      expect(redirect).toHaveBeenCalledWith(
        '/auth/microsoft?oauthRetryCount=1',
      );
    });
  });
});
