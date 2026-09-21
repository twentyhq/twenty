import { checkIfItsAViteStaleChunkLazyLoadingError } from '@/error-handler/utils/checkIfItsAViteStaleChunkLazyLoadingError';

describe('checkIfItsAViteStaleChunkLazyLoadingError', () => {
  it('should return true when error message contains the Vite stale chunk error text', () => {
    const error = new Error(
      'Failed to fetch dynamically imported module: /some/module.js',
    );

    const result = checkIfItsAViteStaleChunkLazyLoadingError(error);

    expect(result).toBe(true);
  });

  it('should return true for the Firefox dynamic import failure message', () => {
    const error = new Error(
      'error loading dynamically imported module: /some/module.js',
    );

    const result = checkIfItsAViteStaleChunkLazyLoadingError(error);

    expect(result).toBe(true);
  });

  it('should return true for the Safari dynamic import failure message', () => {
    const error = new Error('Importing a module script failed.');

    const result = checkIfItsAViteStaleChunkLazyLoadingError(error);

    expect(result).toBe(true);
  });

  it('should return true when a CSS chunk fails to preload', () => {
    const error = new Error(
      'Unable to preload CSS for /assets/SyncEmails-DKxn4rm-.css',
    );

    const result = checkIfItsAViteStaleChunkLazyLoadingError(error);

    expect(result).toBe(true);
  });

  it('should return false when error message does not contain the Vite stale chunk error text', () => {
    const error = new Error('Some other error message');

    const result = checkIfItsAViteStaleChunkLazyLoadingError(error);

    expect(result).toBe(false);
  });
});
