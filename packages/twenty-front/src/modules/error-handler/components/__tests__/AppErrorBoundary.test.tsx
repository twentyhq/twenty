import { render, screen, waitFor } from '@testing-library/react';

import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';

jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
}));

jest.mock('~/utils/reloadWindow', () => ({
  reloadWindow: jest.fn(),
}));

const { captureException } = jest.requireMock('@sentry/react');
const { reloadWindow } = jest.requireMock('~/utils/reloadWindow');

const STALE_CHUNK_RELOAD_TIMESTAMP_KEY = 'staleChunkReloadTimestamp';
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
    jest.clearAllMocks();
  });

  it('should reload synchronously on a stale chunk error when no reload happened recently', () => {
    renderWithBoundary(new Error(STALE_CHUNK_ERROR_MESSAGE));

    expect(reloadWindow).toHaveBeenCalledTimes(1);
    expect(
      window.sessionStorage.getItem(STALE_CHUNK_RELOAD_TIMESTAMP_KEY),
    ).not.toBeNull();
  });

  it('should not reload on a stale chunk error within the reload cooldown', async () => {
    window.sessionStorage.setItem(
      STALE_CHUNK_RELOAD_TIMESTAMP_KEY,
      Date.now().toString(),
    );

    renderWithBoundary(new Error(STALE_CHUNK_ERROR_MESSAGE));

    expect(reloadWindow).not.toHaveBeenCalled();
    expect(screen.getByText('fallback content')).toBeInTheDocument();

    await waitFor(() => {
      expect(captureException).toHaveBeenCalledTimes(1);
    });
  });

  it('should not reload on other errors and still capture them', async () => {
    renderWithBoundary(new Error('Some unrelated error'));

    expect(reloadWindow).not.toHaveBeenCalled();
    expect(screen.getByText('fallback content')).toBeInTheDocument();

    await waitFor(() => {
      expect(captureException).toHaveBeenCalledTimes(1);
    });
  });
});
