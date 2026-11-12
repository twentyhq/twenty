import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

import { timelineThreadChannelFilterFamilyState } from '@/activities/emails/states/timelineThreadChannelFilterFamilyState';
import { WidgetActionMessagesFilter } from '@/page-layout/widgets/messages/components/WidgetActionMessagesFilter';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { MessageChannelType } from '~/generated/graphql';

const RECORD_ID = '20202020-0000-4000-8000-000000000001';

const GMAIL_CHANNEL = {
  type: MessageChannelType.EMAIL,
  provider: 'google',
  applicationId: null,
};
const OUTLOOK_CHANNEL = {
  type: MessageChannelType.EMAIL,
  provider: 'microsoft',
  applicationId: null,
};

let mockTimelineThreadChannels: (typeof GMAIL_CHANNEL)[] = [];

jest.mock('@/ui/layout/contexts/useTargetRecord', () => ({
  useTargetRecord: () => ({
    id: '20202020-0000-4000-8000-000000000001',
    targetObjectNameSingular: 'company',
  }),
}));

jest.mock('@/activities/emails/hooks/useTimelineThreadChannels', () => ({
  useTimelineThreadChannels: () => ({
    timelineThreadChannels: mockTimelineThreadChannels,
    loading: false,
  }),
}));

jest.mock('@/activities/emails/components/MessageChannelLogo', () => ({
  MessageChannelLogo: () => null,
}));

const SelectedChannel = () => {
  const timelineThreadChannelFilter = useAtomFamilyStateValue(
    timelineThreadChannelFilterFamilyState,
    RECORD_ID,
  );

  return <output>{timelineThreadChannelFilter?.provider ?? 'all'}</output>;
};

const Wrapper = getJestMetadataAndApolloMocksWrapper({});

const renderFilter = () =>
  render(
    <I18nProvider i18n={i18n}>
      <WidgetActionMessagesFilter />
      <SelectedChannel />
    </I18nProvider>,
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <Wrapper>{children}</Wrapper>
      ),
    },
  );

describe('WidgetActionMessagesFilter', () => {
  it('stays hidden when the conversations use a single channel', () => {
    mockTimelineThreadChannels = [GMAIL_CHANNEL];

    renderFilter();

    expect(
      screen.queryByRole('button', { name: /Filter conversations/ }),
    ).not.toBeInTheDocument();
  });

  it('filters by a channel of the record and goes back to every conversation', async () => {
    const user = userEvent.setup();

    mockTimelineThreadChannels = [OUTLOOK_CHANNEL, GMAIL_CHANNEL];

    renderFilter();

    await user.click(
      screen.getByRole('button', { name: 'Filter conversations' }),
    );

    expect(
      screen.getAllByRole('menuitemradio').map((item) => item.textContent),
    ).toEqual(['All conversations', 'Gmail and Calendar', 'Outlook']);

    await user.click(screen.getByRole('menuitemradio', { name: 'Outlook' }));

    expect(screen.getByRole('status')).toHaveTextContent('microsoft');
    expect(
      screen.getByRole('button', { name: 'Filter conversations · Outlook' }),
    ).toBeVisible();

    await user.keyboard('{Enter}');
    await user.click(
      await screen.findByRole('menuitemradio', { name: 'All conversations' }),
    );

    expect(screen.getByRole('status')).toHaveTextContent('all');
    expect(
      screen.getByRole('button', { name: 'Filter conversations' }),
    ).toBeVisible();
  });
});
