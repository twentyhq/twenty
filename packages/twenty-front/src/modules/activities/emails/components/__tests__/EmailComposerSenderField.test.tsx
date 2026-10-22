import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { EmailComposerSenderField } from '@/activities/emails/components/EmailComposerSenderField';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={createStore()}>
    <I18nProvider i18n={i18n}>{children}</I18nProvider>
  </JotaiProvider>
);

const toSenderOptions = (handles: string[]) =>
  handles.map((handle) => ({ label: handle, value: handle }));

describe('EmailComposerSenderField', () => {
  it('shows the from address as text when there is a single sender', () => {
    render(
      <EmailComposerSenderField
        senderOptions={toSenderOptions(['jane@example.com'])}
        selectedSender="jane@example.com"
        onSenderChange={jest.fn()}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeVisible();
  });

  it('shows nothing when the single sender is unknown', () => {
    render(
      <EmailComposerSenderField
        senderOptions={[]}
        onSenderChange={jest.fn()}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.queryByText('From')).not.toBeInTheDocument();
  });

  it('lets the user pick another sender when there are several', async () => {
    const user = userEvent.setup();
    const onSenderChange = jest.fn();

    render(
      <EmailComposerSenderField
        senderOptions={toSenderOptions([
          'jane@example.com',
          'sales@example.com',
        ])}
        selectedSender="jane@example.com"
        onSenderChange={onSenderChange}
      />,
      { wrapper: Wrapper },
    );

    await user.click(screen.getByText('jane@example.com'));
    await user.click(await screen.findByText('sales@example.com'));

    expect(onSenderChange).toHaveBeenCalledWith('sales@example.com');
  });
});
