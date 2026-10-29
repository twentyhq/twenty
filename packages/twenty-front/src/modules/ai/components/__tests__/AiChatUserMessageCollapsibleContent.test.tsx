import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatUserMessageCollapsibleContent } from '@/ai/components/AiChatUserMessageCollapsibleContent';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const COLLAPSED_HEIGHT = 240;

const mockRenderedContentHeight = (contentHeight: number) => {
  jest
    .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
    .mockReturnValue(contentHeight);
  jest
    .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
    .mockReturnValue(Math.min(contentHeight, COLLAPSED_HEIGHT));
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

  it('shows a short message without a toggle', () => {
    mockRenderedContentHeight(48);

    renderContent('Which deals close this week?');

    expect(
      screen.getByText('Which deals close this week?'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Show more' }),
    ).not.toBeInTheDocument();
  });

  it('collapses a long message and toggles it open and closed', async () => {
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
