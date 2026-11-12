import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EmailsCardContent } from '@/activities/emails/components/EmailsCardContent';

jest.mock('@/activities/emails/components/EmptyInboxPlaceholder', () => ({
  EmptyInboxPlaceholder: () => <div>No messages yet</div>,
}));

const renderContent = ({
  isFiltered,
  onClearFilter = jest.fn(),
}: {
  isFiltered: boolean;
  onClearFilter?: () => void;
}) =>
  render(
    <I18nProvider i18n={i18n}>
      <EmailsCardContent
        isFiltered={isFiltered}
        onClearFilter={onClearFilter}
        firstQueryLoading={false}
        isFetchingMore={false}
        onLastRowVisible={jest.fn()}
        timelineThreads={[]}
      />
    </I18nProvider>,
  );

describe('EmailsCardContent', () => {
  it('offers to clear the filter when no conversation matches it', async () => {
    const onClearFilter = jest.fn();

    renderContent({ isFiltered: true, onClearFilter });

    expect(screen.getByText('No matching conversations')).toBeVisible();
    expect(screen.queryByText('No messages yet')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Clear filter' }));

    expect(onClearFilter).toHaveBeenCalledTimes(1);
  });

  it('keeps the regular empty state without a filter', () => {
    renderContent({ isFiltered: false });

    expect(screen.getByText('No messages yet')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Clear filter' }),
    ).not.toBeInTheDocument();
  });
});
