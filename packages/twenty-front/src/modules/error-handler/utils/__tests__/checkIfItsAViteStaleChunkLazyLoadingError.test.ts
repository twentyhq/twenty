import { LazyRouteComponentResolutionError } from '@/error-handler/errors/LazyRouteComponentResolutionError';
import { checkIfItsAViteStaleChunkLazyLoadingError } from '@/error-handler/utils/checkIfItsAViteStaleChunkLazyLoadingError';

describe('checkIfItsAViteStaleChunkLazyLoadingError', () => {
  it('should return true when error message contains the Vite stale chunk error text', () => {
    const error = new Error(
      'Failed to fetch dynamically imported module: /some/module.js',
    );

    const result = checkIfItsAViteStaleChunkLazyLoadingError(error);

    expect(result).toBe(true);
  });

  it('should return true when a lazy route component does not resolve', () => {
    const error = new LazyRouteComponentResolutionError({
      routeKey: 'sign-in-up',
      modulePath: '~/pages/auth/SignInUp',
      moduleExports: [],
    });

    const result = checkIfItsAViteStaleChunkLazyLoadingError(error);

    expect(result).toBe(true);
  });

  it('should return false when error message does not contain the Vite stale chunk error text', () => {
    const error = new Error('Some other error message');

    const result = checkIfItsAViteStaleChunkLazyLoadingError(error);

    expect(result).toBe(false);
  });
});
