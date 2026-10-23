import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { AppRouteErrorFallback } from '@/error-handler/components/AppRouteErrorFallback';

jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
  flush: jest.fn().mockResolvedValue(true),
}));

const { captureException } = jest.requireMock('@sentry/react');

const RENDER_ERROR = new Error('Target object metadata item not found');

const Thrower = (): never => {
  throw RENDER_ERROR;
};

describe('AppRouteErrorFallback', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('shows the app fallback and reports the error when a route throws during render', async () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <Thrower />,
        errorElement: <AppRouteErrorFallback />,
      },
    ]);

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByText('Sorry, something went wrong'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Unexpected Application Error!'),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(captureException).toHaveBeenCalledWith(
        RENDER_ERROR,
        expect.any(Function),
      );
    });
  });
});
