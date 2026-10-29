import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatUserMessageCollapsibleContent } from '@/ai/components/AiChatUserMessageCollapsibleContent';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const mockRenderedContentHeight = (contentHeight: number) => {
  jest
    .spyOn(CSSStyleDeclaration.prototype, 'lineHeight', 'get')
    .mockReturnValue('24px');
  jest
    .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
    .mockReturnValue(contentHeight);
};

const renderContent = (text: string) =>
  render(
    <I18nProvider i18n={i18n}>
      <AiChatUserMessageCollapsibleContent>
        {text}
      </AiChatUserMessageCollapsibleContent>
    </I18nProvider>,
  );

describe('AiChatUserMessageCollapsibleContent', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows a message that fits in ten lines without a toggle', () => {
    mockRenderedContentHeight(240);

    renderContent('Which deals close this week?');

    expect(
      screen.getByText('Which deals close this week?'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Show more' }),
    ).not.toBeInTheDocument();
  });

  it('collapses a taller message and toggles it open and closed', async () => {
    mockRenderedContentHeight(960);

    renderContent('Set up my workspace with these detailed instructions');

    const showMoreButton = screen.getByRole('button', { name: 'Show more' });

    expect(showMoreButton).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(showMoreButton);

    const showLessButton = screen.getByRole('button', { name: 'Show less' });

    expect(showLessButton).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(showLessButton);

    expect(
      screen.getByRole('button', { name: 'Show more' }),
    ).toBeInTheDocument();
  });
});
