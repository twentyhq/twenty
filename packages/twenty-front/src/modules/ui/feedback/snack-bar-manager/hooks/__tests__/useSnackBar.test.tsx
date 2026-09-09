import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { I18nProvider } from '@lingui/react';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from 'twenty-ui/feedback';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import { SnackBarToaster } from '@/ui/feedback/snack-bar-manager/components/SnackBarToaster';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type WrapperProps = { children: ReactNode };

const Wrapper = ({ children }: WrapperProps) => (
  <I18nProvider i18n={i18n}>
    <ThemeProvider colorScheme="light">
      <MemoryRouter>
        <ToastProvider>
          {children}
          <SnackBarToaster />
        </ToastProvider>
      </MemoryRouter>
    </ThemeProvider>
  </I18nProvider>
);

describe('useSnackBar', () => {
  it('should preserve actions and dismiss a notification through the shared toaster', async () => {
    const onAction = jest.fn();
    const onClose = jest.fn();
    const { result } = renderHook(() => useSnackBar(), { wrapper: Wrapper });

    act(() => {
      result.current.enqueueSuccessSnackBar({
        message: 'Record saved',
        options: {
          detailedMessage: 'Your changes are available',
          buttonLabel: 'Undo',
          buttonOnClick: onAction,
          onClose,
          progress: 100,
        },
      });
    });

    expect(screen.getByRole('status')).toHaveTextContent('Record saved');
    expect(screen.getByText('Your changes are available')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(screen.queryByRole('status')).not.toBeInTheDocument(),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should deduplicate notifications from the existing enqueue API', () => {
    const { result } = renderHook(() => useSnackBar(), { wrapper: Wrapper });

    act(() => {
      result.current.enqueueInfoSnackBar({
        message: 'Import started',
        options: { dedupeKey: 'import', progress: 100 },
      });
      result.current.enqueueInfoSnackBar({
        message: 'Import started',
        options: { dedupeKey: 'import', progress: 100 },
      });
    });

    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Import started');
  });

  it('should keep record-conflict links inside the frontend router', () => {
    const { result } = renderHook(() => useSnackBar(), { wrapper: Wrapper });
    const apolloError = new CombinedGraphQLErrors({
      errors: [
        {
          message: 'Record already exists',
          extensions: {
            conflictingRecordId: 'existing-record',
            conflictingObjectNameSingular: 'person',
          },
        },
      ],
    });

    act(() => {
      result.current.enqueueErrorSnackBar({
        apolloError,
        options: { progress: 100 },
      });
    });

    expect(screen.getByRole('status')).toHaveTextContent('An error occurred.');
    const action = screen.getByRole('link', { name: 'View existing record' });
    expect(action).toHaveAttribute('href', '/object/person/existing-record');
    expect(action.querySelector('button')).toBeNull();
  });

  it('should update visible labels when the active locale changes', async () => {
    const originalLocale = i18n.locale;
    const onClose = jest.fn();
    const onCancel = jest.fn();
    const { result, unmount } = renderHook(() => useSnackBar(), {
      wrapper: Wrapper,
    });

    act(() => {
      i18n.load('fr', {
        [msg`Success`.id]: 'Succès',
        [msg`Cancel`.id]: 'Annuler',
        [msg`Close`.id]: 'Fermer',
        [msg`Notifications`.id]: 'Notifications',
      });
    });

    try {
      act(() => {
        result.current.enqueueSuccessSnackBar({
          message: 'Record saved',
          options: { onClose, onCancel, progress: 100 },
        });
      });
      const toast = screen.getByRole('status');
      expect(screen.getByLabelText('Success')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();

      act(() => i18n.activate('fr'));

      expect(screen.getByRole('status')).toBe(toast);
      expect(screen.getByLabelText('Succès')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole('button', { name: 'Fermer' }));
      await waitFor(() => expect(toast).not.toBeInTheDocument());
      expect(onClose).toHaveBeenCalledTimes(1);
    } finally {
      unmount();
      act(() => i18n.activate(originalLocale));
    }
  });

  it('should ignore aborted requests', () => {
    const { result } = renderHook(() => useSnackBar(), { wrapper: Wrapper });

    act(() => {
      result.current.enqueueErrorSnackBar({
        apolloError: new DOMException('Request aborted', 'AbortError'),
      });
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
