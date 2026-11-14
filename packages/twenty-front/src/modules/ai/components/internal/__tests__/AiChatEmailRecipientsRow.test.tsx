import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AiChatEmailRecipientsRow } from '@/ai/components/internal/AiChatEmailRecipientsRow';

jest.mock(
  '@/activities/emails/recipients/hooks/useEmailRecipientsResolution',
  () => ({
    useEmailRecipientsResolution: () => ({
      resolutionByRecipientKey: new Map(),
    }),
  }),
);

describe('AiChatEmailRecipientsRow', () => {
  it('does not add a recipient on the Enter that confirms an IME composition', async () => {
    const onChange = jest.fn();

    render(
      <I18nProvider i18n={i18n}>
        <AiChatEmailRecipientsRow
          label="To"
          recipients={[]}
          disabled={false}
          onChange={onChange}
        />
      </I18nProvider>,
    );

    const input = screen.getByRole('textbox');

    await userEvent.type(input, '山田');
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });

    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('山田');

    await userEvent.type(input, ' <yamada@example.com>{Enter}');

    expect(onChange).toHaveBeenCalledWith([
      { address: 'yamada@example.com', displayName: '山田' },
    ]);
  });
});
