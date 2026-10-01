import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { AiChatUnreadLine } from '@/ai/components/AiChatUnreadLine';

describe('AiChatUnreadLine', () => {
  it('separates new messages under a New label', () => {
    render(
      <I18nProvider i18n={i18n}>
        <AiChatUnreadLine />
      </I18nProvider>,
    );

    expect(
      screen.getByRole('separator', { name: 'New messages' }),
    ).toHaveTextContent('New');
  });
});
