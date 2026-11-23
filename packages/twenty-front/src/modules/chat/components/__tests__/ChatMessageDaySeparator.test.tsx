import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, within } from '@testing-library/react';
import { type ReactNode } from 'react';

import { ChatMessageDaySeparator } from '@/chat/components/ChatMessageDaySeparator';

const renderWithProviders = (ui: ReactNode) =>
  render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);

describe('ChatMessageDaySeparator', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-23T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('labels the day a message was sent', () => {
    renderWithProviders(
      <ChatMessageDaySeparator date="2026-11-23T08:00:00.000Z" />,
    );

    const separator = screen.getByRole('separator', { name: 'Today' });

    expect(within(separator).getByText('Today')).toBeInTheDocument();
    expect(within(separator).queryByText('New')).not.toBeInTheDocument();
  });

  it('marks the day as new when its first message is the first unread one', () => {
    renderWithProviders(
      <ChatMessageDaySeparator date="2026-11-23T08:00:00.000Z" isFirstUnread />,
    );

    const separator = screen.getByRole('separator', { name: 'Today, New' });

    expect(within(separator).getByText('Today')).toBeInTheDocument();
    expect(within(separator).getByText('New')).toBeInTheDocument();
    expect(screen.getAllByRole('separator')).toHaveLength(1);
  });
});
