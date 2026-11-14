import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { EmailRecipientsFields } from '@/activities/emails/recipients/components/EmailRecipientsFields';
import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/types/EmailRecipientsByFieldId';

jest.mock(
  '@/activities/emails/recipients/hooks/useEmailRecipientSuggestions',
  () => ({
    useEmailRecipientSuggestions: () => ({ suggestions: [], error: undefined }),
  }),
);
jest.mock(
  '@/activities/emails/recipients/hooks/useEmailRecipientsResolution',
  () => ({
    useEmailRecipientsResolution: () => ({
      resolutionByRecipientKey: new Map(),
    }),
  }),
);

const RECIPIENTS: EmailRecipientsByFieldId = {
  to: [{ address: 'tim@apple.dev' }],
  cc: [],
  bcc: [],
};

const renderFields = ({
  recipientsByFieldId = RECIPIENTS,
  onChange = jest.fn(),
  readonly = false,
}: {
  recipientsByFieldId?: EmailRecipientsByFieldId;
  onChange?: (recipientsByFieldId: EmailRecipientsByFieldId) => void;
  readonly?: boolean;
} = {}) =>
  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <ToastProvider>
          <EmailRecipientsFields
            recipientsByFieldId={recipientsByFieldId}
            onChange={onChange}
            readonly={readonly}
          />
        </ToastProvider>
      </Provider>
    </I18nProvider>,
  );

describe('EmailRecipientsFields', () => {
  beforeAll(() => {
    // jsdom has no PointerEvent, which the recipients' drag sensor checks on click
    window.PointerEvent ??= MouseEvent as typeof PointerEvent;
  });

  it('reveals Cc and Bcc on demand', async () => {
    const user = userEvent.setup();

    renderFields();

    expect(
      screen.queryByRole('combobox', { name: 'Cc' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cc/Bcc' }));

    expect(screen.getByRole('combobox', { name: 'Cc' })).toHaveFocus();
    expect(screen.getByRole('combobox', { name: 'Bcc' })).toBeInTheDocument();
  });

  it('shows Cc and Bcc when they already have recipients', () => {
    renderFields({
      recipientsByFieldId: {
        ...RECIPIENTS,
        bcc: [{ address: 'joe@acme.com' }],
      },
    });

    expect(screen.getByRole('combobox', { name: 'Bcc' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cc/Bcc' }),
    ).not.toBeInTheDocument();
  });

  it('removes a recipient from its field', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderFields({ onChange });

    await user.click(
      screen.getByRole('button', { name: 'Remove tim@apple.dev' }),
    );

    expect(onChange).toHaveBeenCalledWith({ to: [], cc: [], bcc: [] });
  });

  it('only lists recipients when read-only', () => {
    renderFields({ readonly: true });

    expect(screen.getByText('tim@apple.dev')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remove tim@apple.dev' }),
    ).not.toBeInTheDocument();
  });
});
