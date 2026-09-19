import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatMessageReadReceipt } from '@/ai/components/AiChatMessageReadReceipt';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const MESSAGE_ID = 'message-1';

let receipt: {
  shouldDisplayReceipt: boolean;
  readers: { id: string; name: { firstName: string; lastName: string } }[];
};

jest.mock('@/ai/hooks/useAiChatOwnMessageReadReceipt', () => ({
  useAiChatOwnMessageReadReceipt: () => receipt,
}));

const reader = (firstName: string, lastName: string) => ({
  id: `workspace-member-${firstName}`,
  name: { firstName, lastName },
});

const renderReceipt = () =>
  render(
    <I18nProvider i18n={i18n}>
      <AiChatMessageReadReceipt messageId={MESSAGE_ID} />
    </I18nProvider>,
  );

describe('AiChatMessageReadReceipt', () => {
  it('reads as sent while nobody else has caught up', () => {
    receipt = { shouldDisplayReceipt: true, readers: [] };

    renderReceipt();

    expect(screen.getByText('Sent')).toBeInTheDocument();
  });

  it('names the reader once somebody has read it', () => {
    receipt = {
      shouldDisplayReceipt: true,
      readers: [reader('Lucas', 'Bernard')],
    };

    renderReceipt();

    expect(screen.getByText('Read by Lucas Bernard')).toBeInTheDocument();
  });

  it('counts the readers it does not name', () => {
    receipt = {
      shouldDisplayReceipt: true,
      readers: [
        reader('Lucas', 'Bernard'),
        reader('Marie', 'Dupont'),
        reader('Paul', 'Martin'),
      ],
    };

    renderReceipt();

    expect(
      screen.getByText('Read by Lucas Bernard, Marie Dupont +1'),
    ).toBeInTheDocument();
  });

  it('shows nothing on a message that carries no receipt', () => {
    receipt = { shouldDisplayReceipt: false, readers: [] };

    const { container } = renderReceipt();

    expect(container).toBeEmptyDOMElement();
  });
});
