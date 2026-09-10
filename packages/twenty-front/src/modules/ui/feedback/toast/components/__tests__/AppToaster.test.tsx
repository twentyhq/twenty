import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { type I18n, i18n, setupI18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { I18nProvider } from '@lingui/react';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider, useToast } from 'twenty-ui/feedback';
import { Button } from 'twenty-ui/input';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { AppToaster } from '@/ui/feedback/toast/components/AppToaster';

type WrapperProps = { children: ReactNode; i18nInstance?: I18n };

const Wrapper = ({ children, i18nInstance = i18n }: WrapperProps) => (
  <I18nProvider i18n={i18nInstance}>
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

describe('AppToaster', () => {
  it('should preserve actions and dismiss a notification through the shared toaster', async () => {
    const onAction = jest.fn();
    const onClose = jest.fn();
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });

    act(() => {
      result.current.enqueueToast({
        variant: 'success',
        children: 'Record saved',
        description: 'Your changes are available',
        action: (
          <Button
            title="Undo"
            ariaLabel="Undo"
            onClick={onAction}
            variant="tertiary"
            size="small"
          />
        ),
        onClose,
        progress: 100,
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

  it('should render rich notification content without converting it to text', () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });

    act(() => {
      result.current.enqueueToast({
        children: <strong>Record saved</strong>,
        description: <a href="/records">View records</a>,
        progress: 100,
      });
    });

    expect(screen.getByRole('status')).toHaveTextContent('Record saved');
    expect(screen.getByRole('link', { name: 'View records' })).toHaveAttribute(
      'href',
      '/records',
    );
  });

  it('should keep record-conflict links inside the frontend router', () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });
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
      result.current.enqueueToast(
        getToastOptionsFromError({ error: apolloError, progress: 100 }),
      );
    });

    expect(screen.getByRole('status')).toHaveTextContent('An error occurred.');
    const action = screen.getByRole('link', { name: 'View existing record' });
    expect(action).toHaveAttribute('href', '/object/person/existing-record');
    expect(action.querySelector('button')).toBeNull();
  });

  it('should update visible labels when the active locale changes', async () => {
    const testI18n = setupI18n({
      locale: 'en',
      messages: {
        en: { ...i18n.messages },
        fr: {
          [msg`Success`.id]: 'Succès',
          [msg`Cancel`.id]: 'Annuler',
          [msg`Close`.id]: 'Fermer',
          [msg`Notifications`.id]: 'Notifications',
        },
      },
    });
    const onClose = jest.fn();
    const onCancel = jest.fn();
    const { result } = renderHook(() => useToast(), {
      wrapper: ({ children }) => (
        <Wrapper i18nInstance={testI18n}>{children}</Wrapper>
      ),
    });

    act(() => {
      result.current.enqueueToast({
        variant: 'success',
        children: 'Record saved',
        onClose,
        onCancel,
        progress: 100,
      });
    });
    const toast = screen.getByRole('status');
    expect(screen.getByLabelText('Success')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();

    act(() => testI18n.activate('fr'));

    expect(screen.getByRole('status')).toBe(toast);
    expect(screen.getByLabelText('Succès')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    await waitFor(() => expect(toast).not.toBeInTheDocument());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it.each([
    { error: new Error('Connection lost'), message: 'Connection lost' },
    {
      error: new CombinedGraphQLErrors({
        errors: [
          {
            message: 'Internal error',
            extensions: { userFriendlyMessage: 'Permission denied' },
          },
        ],
      }),
      message: 'Permission denied',
    },
    {
      error: new CombinedGraphQLErrors({
        errors: [
          {
            message: 'Internal error',
            extensions: { userFriendlyMessage: msg`An error occurred.` },
          },
        ],
      }),
      message: 'An error occurred.',
    },
    { error: undefined, message: 'An error occurred.' },
  ])('should display $message for a caught error', ({ error, message }) => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });

    act(() => {
      result.current.enqueueToast(
        getToastOptionsFromError({ error, progress: 100 }),
      );
    });

    expect(screen.getByRole('status')).toHaveTextContent(message);
  });

  it('should ignore aborted requests', () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper });

    act(() => {
      result.current.enqueueToast(
        getToastOptionsFromError({
          error: new DOMException('Request aborted', 'AbortError'),
        }),
      );
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
