import { act, render } from '@testing-library/react';

import { PromiseRejectionEffect } from '@/error-handler/components/PromiseRejectionEffect';

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
}));

const dispatchUnhandledRejection = async (reason: unknown) => {
  const event = new Event('unhandledrejection');

  Object.defineProperty(event, 'reason', { value: reason });

  await act(async () => {
    window.dispatchEvent(event);
  });
};

describe('PromiseRejectionEffect', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each(['Cancelled', 'cancelled'])(
    'should not show a toast for a request Safari reports as %s',
    async (message) => {
      render(<PromiseRejectionEffect />);

      await dispatchUnhandledRejection(new TypeError(message));

      expect(mockEnqueueToast).not.toHaveBeenCalled();
    },
  );

  it('should show a toast for other errors', async () => {
    render(<PromiseRejectionEffect />);

    await dispatchUnhandledRejection(new Error('Something broke'));

    expect(mockEnqueueToast).toHaveBeenCalledTimes(1);
  });
});
