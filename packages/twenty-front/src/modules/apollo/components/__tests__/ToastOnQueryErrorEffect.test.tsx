import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { AppToaster } from '@/ui/feedback/toast/components/AppToaster';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from 'twenty-ui/primitives/feedback';
import { ThemeProvider } from 'twenty-ui/theme-constants';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <ThemeProvider colorScheme="light">
      <MemoryRouter>
        <ToastProvider>
          {children}
          <AppToaster />
        </ToastProvider>
      </MemoryRouter>
    </ThemeProvider>
  </I18nProvider>
);

it('notifies when a query fails without repeating the same error on rerender', () => {
  const error = new Error('Connection lost');
  const { rerender } = render(<ToastOnQueryErrorEffect error={undefined} />, {
    wrapper: Wrapper,
  });

  expect(screen.queryByRole('status')).not.toBeInTheDocument();

  rerender(<ToastOnQueryErrorEffect error={error} />);
  expect(screen.getByRole('status')).toHaveTextContent('Connection lost');

  rerender(<ToastOnQueryErrorEffect error={error} />);
  expect(screen.getAllByRole('status')).toHaveLength(1);

  rerender(<ToastOnQueryErrorEffect error={new Error('Request timed out')} />);
  expect(screen.getAllByRole('status')).toHaveLength(2);
  expect(screen.getByText('Request timed out')).toBeInTheDocument();
});

it('preserves the caller-specific error message', () => {
  render(
    <ToastOnQueryErrorEffect
      error={new Error('Connection lost')}
      message="Failed to load webhook"
    />,
    { wrapper: Wrapper },
  );

  expect(screen.getByRole('status')).toHaveTextContent(
    'Failed to load webhook',
  );
  expect(screen.queryByText('Connection lost')).not.toBeInTheDocument();
});

it('ignores an aborted query', () => {
  render(
    <ToastOnQueryErrorEffect
      error={new DOMException('Request aborted', 'AbortError')}
    />,
    { wrapper: Wrapper },
  );

  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
