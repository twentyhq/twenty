import { render, waitFor } from '@testing-library/react';

import { PromiseRejectionEffect } from '@/error-handler/components/PromiseRejectionEffect';

jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
}));

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/feedback', () => ({
  ...jest.requireActual('twenty-ui/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const { captureException } = jest.requireMock('@sentry/react');

const dispatchUnhandledRejection = (reason: unknown) => {
  const event = new Event('unhandledrejection');
  Object.defineProperty(event, 'reason', { value: reason });

  window.dispatchEvent(event);
};

describe('PromiseRejectionEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<PromiseRejectionEffect />);
  });

  it('should not toast a stale chunk error', async () => {
    dispatchUnhandledRejection(new Error('Importing a module script failed.'));

    await waitFor(() => {
      expect(captureException).toHaveBeenCalledTimes(1);
    });

    expect(mockEnqueueToast).not.toHaveBeenCalled();
  });

  it('should still toast an unrelated error', async () => {
    dispatchUnhandledRejection(new Error('Some unrelated error'));

    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'error',
      children: 'Some unrelated error',
    });

    await waitFor(() => {
      expect(captureException).toHaveBeenCalledTimes(1);
    });
  });

  it('should not toast an abort error', async () => {
    dispatchUnhandledRejection({ name: 'AbortError' });

    await waitFor(() => {
      expect(captureException).toHaveBeenCalledTimes(1);
    });

    expect(mockEnqueueToast).not.toHaveBeenCalled();
  });

  it('should toast a generic message when the reason is not an Error', async () => {
    dispatchUnhandledRejection('something went wrong');

    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'error',
      children: 'An error occurred.',
    });

    await waitFor(() => {
      expect(captureException).toHaveBeenCalledTimes(1);
    });
  });
});
