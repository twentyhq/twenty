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

const dispatchUnhandledRejection = (reason: unknown) => {
  const event = new Event('unhandledrejection') as Event & { reason: unknown };
  Object.defineProperty(event, 'reason', { value: reason });

  window.dispatchEvent(event);
};

describe('PromiseRejectionEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<PromiseRejectionEffect />);
  });

  it.each([
    'Importing a module script failed.',
    'Failed to fetch dynamically imported module: /assets/Page-abc123.js',
    'error loading dynamically imported module: /assets/Page-abc123.js',
    'Unable to preload CSS for /assets/Page-abc123.css',
  ])('should not snackbar the stale chunk error "%s"', async (message) => {
    dispatchUnhandledRejection(new Error(message));

    await waitFor(() => {
      expect(captureException).toHaveBeenCalledTimes(1);
    });

    expect(enqueueErrorSnackBar).not.toHaveBeenCalled();
  });

  it('should still snackbar an unrelated error', async () => {
    dispatchUnhandledRejection(new Error('Some unrelated error'));

    expect(enqueueErrorSnackBar).toHaveBeenCalledWith({
      message: 'Some unrelated error',
    });

    await waitFor(() => {
      expect(captureException).toHaveBeenCalledTimes(1);
    });
  });

  it('should not snackbar an abort error', async () => {
    dispatchUnhandledRejection({ name: 'AbortError' });

    await waitFor(() => {
      expect(captureException).toHaveBeenCalledTimes(1);
    });

    expect(enqueueErrorSnackBar).not.toHaveBeenCalled();
  });

  it('should snackbar a generic message when the reason is not an Error', async () => {
    dispatchUnhandledRejection('something went wrong');

    expect(enqueueErrorSnackBar).toHaveBeenCalledWith({});

    await waitFor(() => {
      expect(captureException).toHaveBeenCalledTimes(1);
    });
  });
});
