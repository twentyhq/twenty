import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EmailsCardContent } from '@/activities/emails/components/EmailsCardContent';

jest.mock('@/activities/emails/components/EmptyInboxPlaceholder', () => ({
  EmptyInboxPlaceholder: () => <div>No messages yet</div>,
}));

jest.mock(
  '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder',
  () => ({ AnimatedPlaceholder: () => null }),
);

const renderContent = ({
  error,
  onRetry = jest.fn(),
  timelineThreads = [],
}: Partial<
  Pick<
    React.ComponentProps<typeof EmailsCardContent>,
    'error' | 'onRetry' | 'timelineThreads'
  >
>) =>
  render(
    <I18nProvider i18n={i18n}>
      <EmailsCardContent
        error={error}
        onRetry={onRetry}
        firstQueryLoading={false}
        isFetchingMore={false}
        onLastRowVisible={jest.fn()}
        timelineThreads={timelineThreads}
      />
    </I18nProvider>,
  );

describe('EmailsCardContent', () => {
  it('shows an error with a retry instead of the empty state', async () => {
    const onRetry = jest.fn();

    renderContent({
      error: new Error('Network error'),
      onRetry,
    });

    expect(screen.getByText("We couldn't load the messages")).toBeVisible();
    expect(screen.queryByText('No messages yet')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state once the record has no conversation', () => {
    renderContent({});

    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });
});
