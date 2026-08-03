import { render, waitFor } from '@testing-library/react';

import { PromiseRejectionEffect } from '@/error-handler/components/PromiseRejectionEffect';

jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
}));

const enqueueErrorSnackBar = jest.fn();

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({ enqueueErrorSnackBar }),
}));

const { captureException } = jest.requireMock('@sentry/react');

const captureScopeOnce = () => {
  const scope = {
    setExtras: jest.fn(),
    setFingerprint: jest.fn(),
    setTag: jest.fn(),
  };

  captureException.mockImplementationOnce(
    (_error: unknown, callback: (scope: unknown) => unknown) => callback(scope),
  );

  return scope;
};

const dispatchUnhandledRejection = (reason: unknown) => {
  const event = new Event('unhandledrejection') as Event & { reason: unknown };
  Object.defineProperty(event, 'reason', { value: reason });

  window.dispatchEvent(event);
};

describe('PromiseRejectionEffect', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<PromiseRejectionEffect />);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it.each([
    'Importing a module script failed.',
    'Failed to fetch dynamically imported module: /assets/Page-abc123.js',
    'error loading dynamically imported module: /assets/Page-abc123.js',
    'Unable to preload CSS for /assets/Page-abc123.css',
  ])('should not snackbar the stale chunk error "%s"', async (message) => {
    const scope = captureScopeOnce();

    dispatchUnhandledRejection(new Error(message));

    await waitFor(() => {
      expect(scope.setTag).toHaveBeenCalledWith(
        'errorSink',
        'promiseRejectionStaleChunk',
      );
    });

    expect(enqueueErrorSnackBar).not.toHaveBeenCalled();
    expect(scope.setExtras).toHaveBeenCalledWith({ mechanism: 'onUnhandle' });
  });

  it('should fingerprint every stale chunk error identically so deploys do not split the Sentry issue', async () => {
    const firstDeployScope = captureScopeOnce();

    dispatchUnhandledRejection(
      new Error(
        'Failed to fetch dynamically imported module: /assets/Page-abc123.js',
      ),
    );

    await waitFor(() => {
      expect(firstDeployScope.setFingerprint).toHaveBeenCalledTimes(1);
    });

    const secondDeployScope = captureScopeOnce();

    dispatchUnhandledRejection(
      new Error(
        'Failed to fetch dynamically imported module: /assets/Other-def456.js',
      ),
    );

    await waitFor(() => {
      expect(secondDeployScope.setFingerprint).toHaveBeenCalledTimes(1);
    });

    expect(secondDeployScope.setFingerprint).toHaveBeenCalledWith(
      firstDeployScope.setFingerprint.mock.calls[0][0],
    );
  });

  it('should still snackbar an unrelated error and tag it as the plain rejection sink', async () => {
    const scope = captureScopeOnce();

    dispatchUnhandledRejection(new Error('Some unrelated error'));

    expect(enqueueErrorSnackBar).toHaveBeenCalledWith({
      message: 'Some unrelated error',
    });

    await waitFor(() => {
      expect(scope.setTag).toHaveBeenCalledWith(
        'errorSink',
        'promiseRejection',
      );
    });

    expect(scope.setFingerprint).toHaveBeenCalledWith(['Some unrelated error']);
  });

  it('should not snackbar an abort error', async () => {
    const scope = captureScopeOnce();

    dispatchUnhandledRejection({ name: 'AbortError' });

    await waitFor(() => {
      expect(scope.setTag).toHaveBeenCalledWith(
        'errorSink',
        'promiseRejection',
      );
    });

    expect(enqueueErrorSnackBar).not.toHaveBeenCalled();
  });

  it('should leave Sentry its default grouping when the reason carries no fingerprintable value', async () => {
    const scope = captureScopeOnce();

    dispatchUnhandledRejection({ name: 'AbortError' });

    await waitFor(() => {
      expect(scope.setExtras).toHaveBeenCalledTimes(1);
    });

    expect(scope.setFingerprint).not.toHaveBeenCalled();
  });

  it('should snackbar a generic message when the reason is not an Error', async () => {
    const scope = captureScopeOnce();

    dispatchUnhandledRejection('something went wrong');

    expect(enqueueErrorSnackBar).toHaveBeenCalledWith({});

    await waitFor(() => {
      expect(scope.setExtras).toHaveBeenCalledTimes(1);
    });

    expect(scope.setTag).toHaveBeenCalledWith('errorSink', 'promiseRejection');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
