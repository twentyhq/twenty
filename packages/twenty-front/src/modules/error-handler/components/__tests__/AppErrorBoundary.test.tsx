import { render, screen, waitFor } from '@testing-library/react';

import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { STALE_CHUNK_RELOAD_TIMESTAMP_KEY } from '@/error-handler/constants/StaleChunkReloadTimestampKey';

jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
  flush: jest.fn().mockResolvedValue(true),
}));

jest.mock('~/utils/reloadWindow', () => ({
  reloadWindow: jest.fn(),
}));

const { captureException, flush } = jest.requireMock('@sentry/react');
const { reloadWindow } = jest.requireMock('~/utils/reloadWindow');

const STALE_CHUNK_ERROR_MESSAGE =
  'Failed to fetch dynamically imported module: /assets/Page.js';

type ThrowerProps = {
  error: Error;
};

const Thrower = ({ error }: ThrowerProps): never => {
  throw error;
};

const Fallback = () => <div>fallback content</div>;

const renderWithBoundary = (error: Error) =>
  render(
    <AppErrorBoundary
      FallbackComponent={Fallback}
      resetOnLocationChange={false}
    >
      <Thrower error={error} />
    </AppErrorBoundary>,
  );

describe('AppErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    window.sessionStorage.clear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should capture with Sentry then reload on a stale chunk error when no reload happened recently', async () => {
    renderWithBoundary(new Error(STALE_CHUNK_ERROR_MESSAGE));

    expect(
      window.sessionStorage.getItem(STALE_CHUNK_RELOAD_TIMESTAMP_KEY),
    ).not.toBeNull();

    await waitFor(() => {
      expect(reloadWindow).toHaveBeenCalledTimes(1);
    });

    expect(captureException).toHaveBeenCalledTimes(1);
    expect(captureException.mock.invocationCallOrder[0]).toBeLessThan(
      reloadWindow.mock.invocationCallOrder[0],
    );
  });

  it('should still reload after the flush timeout when the Sentry flush hangs', async () => {
    jest.useFakeTimers();
    flush.mockImplementationOnce(() => new Promise(() => {}));

    renderWithBoundary(new Error(STALE_CHUNK_ERROR_MESSAGE));

    await jest.advanceTimersByTimeAsync(0);

    expect(captureException).toHaveBeenCalledTimes(1);
    expect(reloadWindow).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(2_000);

    expect(reloadWindow).toHaveBeenCalledTimes(1);
  });

  it('should not reload on a stale chunk error within the reload cooldown', async () => {
    window.sessionStorage.setItem(
      STALE_CHUNK_RELOAD_TIMESTAMP_KEY,
      Date.now().toString(),
    );

    renderWithBoundary(new Error(STALE_CHUNK_ERROR_MESSAGE));

    expect(screen.getByText('fallback content')).toBeInTheDocument();

    await waitFor(() => {
      expect(captureException).toHaveBeenCalledTimes(1);
    });

    expect(reloadWindow).not.toHaveBeenCalled();
  });

  it('should not reload on a stale chunk error when the reload timestamp cannot be stored', async () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('sessionStorage access denied');
    });

    renderWithBoundary(new Error(STALE_CHUNK_ERROR_MESSAGE));

    expect(screen.getByText('fallback content')).toBeInTheDocument();

    await waitFor(() => {
      expect(captureException).toHaveBeenCalledTimes(1);
    });

    expect(reloadWindow).not.toHaveBeenCalled();
  });

  it('should not reload on other errors and still capture them', async () => {
    renderWithBoundary(new Error('Some unrelated error'));

    expect(screen.getByText('fallback content')).toBeInTheDocument();

    await waitFor(() => {
      expect(captureException).toHaveBeenCalledTimes(1);
    });

    expect(reloadWindow).not.toHaveBeenCalled();
  });
});
