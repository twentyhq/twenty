import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
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

const StatefulEmailRecipientsFields = ({
  initialRecipientsByFieldId,
  onRecipientsChange,
  readonly,
}: {
  initialRecipientsByFieldId: EmailRecipientsByFieldId;
  onRecipientsChange: (recipientsByFieldId: EmailRecipientsByFieldId) => void;
  readonly: boolean;
}) => {
  const [recipientsByFieldId, setRecipientsByFieldId] = useState(
    initialRecipientsByFieldId,
  );

  onRecipientsChange(recipientsByFieldId);

  return (
    <EmailRecipientsFields
      recipientsByFieldId={recipientsByFieldId}
      onChange={setRecipientsByFieldId}
      readonly={readonly}
    />
  );
};

const renderFields = ({
  recipientsByFieldId = RECIPIENTS,
  readonly = false,
}: {
  recipientsByFieldId?: EmailRecipientsByFieldId;
  readonly?: boolean;
} = {}) => {
  let latestRecipientsByFieldId = recipientsByFieldId;

  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <ToastProvider>
          <StatefulEmailRecipientsFields
            initialRecipientsByFieldId={recipientsByFieldId}
            onRecipientsChange={(nextRecipientsByFieldId) => {
              latestRecipientsByFieldId = nextRecipientsByFieldId;
            }}
            readonly={readonly}
          />
        </ToastProvider>
      </Provider>
    </I18nProvider>,
  );

  return { getRecipientsByFieldId: () => latestRecipientsByFieldId };
};

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

  it('keeps Cc and Bcc open after their last recipient is removed', async () => {
    const user = userEvent.setup();
    const { getRecipientsByFieldId } = renderFields({
      recipientsByFieldId: { ...RECIPIENTS, cc: [{ address: 'joe@acme.com' }] },
    });

    await user.click(
      screen.getByRole('button', { name: 'Remove joe@acme.com' }),
    );

    expect(getRecipientsByFieldId().cc).toEqual([]);
    expect(screen.getByRole('combobox', { name: 'Cc' })).toBeInTheDocument();
  });

  it('keeps both changes when removing a Cc recipient commits typed To text', async () => {
    const user = userEvent.setup();
    const { getRecipientsByFieldId } = renderFields({
      recipientsByFieldId: { ...RECIPIENTS, cc: [{ address: 'joe@acme.com' }] },
    });

    await user.type(
      screen.getByRole('combobox', { name: 'To' }),
      'ana@acme.com',
    );
    await user.keyboard('{Escape}');
    await user.click(
      screen.getByRole('button', { name: 'Remove joe@acme.com' }),
    );

    expect(getRecipientsByFieldId()).toEqual({
      to: [{ address: 'tim@apple.dev' }, { address: 'ana@acme.com' }],
      cc: [],
      bcc: [],
    });
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
