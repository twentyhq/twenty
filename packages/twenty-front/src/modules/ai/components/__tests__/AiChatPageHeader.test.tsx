import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('@/ui/layout/page/components/PageCardHeader', () => ({
  PageCardHeader: ({ title }: { title: ReactNode }) => <div>{title}</div>,
}));

describe('AiChatPageHeader', () => {
  it('titles the page of a chat that has no record yet', () => {
    render(
      <I18nProvider i18n={i18n}>
        <AiChatPageHeader />
      </I18nProvider>,
    );

    expect(screen.getByText('New chat')).toBeVisible();
  });
});
