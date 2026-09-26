import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { ChatThreadsCardContent } from '@/page-layout/widgets/chat-threads/components/ChatThreadsCardContent';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const WIDGET_ID = '20202020-0000-4000-8000-000000000001';

// The payload the resolver returns to a role without the AI permission flag.
const FORBIDDEN_ERROR = new CombinedGraphQLErrors({
  data: null,
  errors: [
    {
      message: 'Entity performing the request does not have permission',
      extensions: { code: 'FORBIDDEN', subCode: 'PERMISSION_DENIED' },
    },
  ],
});

const NETWORK_ERROR = new Error('Failed to fetch');

const renderContent = ({
  loading = false,
  error,
  onRetry = jest.fn(),
}: {
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}) =>
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <ChatThreadsCardContent
          loading={loading}
          error={error}
          widgetId={WIDGET_ID}
          onRetry={onRetry}
          threads={[]}
        />
      </MemoryRouter>
    </I18nProvider>,
    { wrapper: getJestMetadataAndApolloMocksWrapper({}) },
  );

describe('ChatThreadsCardContent', () => {
  // Every state below renders with no threads in hand, which is exactly when
  // the card could claim "No conversations" without knowing that to be true.
  it('does not claim the record has no conversations while loading', () => {
    renderContent({ loading: true });

    expect(screen.queryByText('No conversations')).not.toBeInTheDocument();
    expect(
      screen.queryByText("We couldn't load the conversations"),
    ).not.toBeInTheDocument();
  });

  it('reports a failed load rather than an empty record, and retries', async () => {
    const onRetry = jest.fn();

    renderContent({ error: NETWORK_ERROR, onRetry });

    expect(
      screen.getByText("We couldn't load the conversations"),
    ).toBeInTheDocument();
    expect(screen.queryByText('No conversations')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // A denial is not transient, so a retry here could never succeed.
  it('does not offer a retry when the caller is not allowed to read conversations', () => {
    renderContent({ error: FORBIDDEN_ERROR });

    expect(
      screen.queryByRole('button', { name: 'Try again' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('No conversations')).not.toBeInTheDocument();
  });

  it('shows the empty state once the record is known to have none', () => {
    renderContent({});

    expect(screen.getByText('No conversations')).toBeInTheDocument();
  });
});
