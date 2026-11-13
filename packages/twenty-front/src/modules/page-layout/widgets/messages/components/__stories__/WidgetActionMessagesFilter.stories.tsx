import { TIMELINE_THREADS_REFETCH_QUERIES } from '@/activities/emails/constants/TimelineThreadsRefetchQueries';
import { timelineThreadChannelFilterFamilyState } from '@/activities/emails/states/timelineThreadChannelFilterFamilyState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { WidgetActionMessagesFilter } from '@/page-layout/widgets/messages/components/WidgetActionMessagesFilter';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { MessageChannelType } from '~/generated/graphql';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

const TARGET_RECORD_ID = 'story-company';

const OUTLOOK_CHANNEL = {
  __typename: 'TimelineThreadChannel',
  type: MessageChannelType.EMAIL,
  provider: 'microsoft',
  applicationId: null,
};

const GMAIL_CHANNEL = {
  ...OUTLOOK_CHANNEL,
  provider: 'google',
};

let timelineThreadChannels = [GMAIL_CHANNEL, OUTLOOK_CHANNEL];

const getTimelineThreadChannelFilter = () =>
  jotaiStore.get(
    timelineThreadChannelFilterFamilyState.atomFamily(TARGET_RECORD_ID),
  );

const RefreshTimelineButton = () => {
  const apolloCoreClient = useApolloCoreClient();

  return (
    <Button
      onClick={() =>
        apolloCoreClient.refetchQueries({
          include: TIMELINE_THREADS_REFETCH_QUERIES,
        })
      }
    >
      Refresh timeline
    </Button>
  );
};

const meta: Meta<typeof WidgetActionMessagesFilter> = {
  title: 'Modules/PageLayout/Widgets/Messages/WidgetActionMessagesFilter',
  component: WidgetActionMessagesFilter,
  decorators: [
    (Story) => (
      <LayoutRenderingProvider
        value={{
          layoutType: PageLayoutType.RECORD_PAGE,
          targetRecordIdentifier: {
            id: TARGET_RECORD_ID,
            targetObjectNameSingular: StandardObjectNameSingular.Company,
          },
        }}
      >
        <Story />
      </LayoutRenderingProvider>
    ),
    ComponentDecorator,
  ],
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query('GetTimelineThreadChannelsFromObjectRecord', () =>
          HttpResponse.json({
            data: {
              getTimelineThreadChannelsFromObjectRecord: timelineThreadChannels,
            },
          }),
        ),
      ],
    },
  },
  beforeEach: async () => {
    timelineThreadChannels = [GMAIL_CHANNEL, OUTLOOK_CHANNEL];
    jotaiStore.set(
      timelineThreadChannelFilterFamilyState.atomFamily(TARGET_RECORD_ID),
      null,
    );
    await mockedApolloClient.clearStore();
  },
};

export default meta;
type Story = StoryObj<typeof WidgetActionMessagesFilter>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menu = within(document.body);

    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: 'Filter conversations' },
        { timeout: 3000 },
      ),
    );

    await expect(
      (await menu.findAllByRole('menuitemradio')).map(
        (item) => item.textContent,
      ),
    ).toEqual(['All conversations', 'Gmail and Calendar', 'Outlook']);

    await userEvent.click(menu.getByRole('menuitemradio', { name: /Outlook/ }));

    await waitFor(() =>
      expect(getTimelineThreadChannelFilter()).toEqual({
        type: MessageChannelType.EMAIL,
        provider: 'microsoft',
        applicationId: null,
      }),
    );
    await expect(
      canvas.getByRole('button', {
        name: 'Filter conversations · Outlook',
      }),
    ).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Filter conversations · Outlook' }),
    );
    await userEvent.click(
      await menu.findByRole('menuitemradio', { name: /All conversations/ }),
    );

    await waitFor(() => expect(getTimelineThreadChannelFilter()).toBeNull());
    await expect(
      canvas.getByRole('button', { name: 'Filter conversations' }),
    ).toBeVisible();
  },
};

export const HiddenWithASingleChannel: Story = {
  beforeEach: () => {
    timelineThreadChannels = [GMAIL_CHANNEL];
  },
  render: () => (
    <>
      <WidgetActionMessagesFilter />
      <RefreshTimelineButton />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole('button', { name: 'Refresh timeline' });
    await new Promise((resolve) => setTimeout(resolve, 500));

    await expect(
      canvas.queryByRole('button', { name: /Filter conversations/ }),
    ).not.toBeInTheDocument();

    timelineThreadChannels = [GMAIL_CHANNEL, OUTLOOK_CHANNEL];

    await userEvent.click(
      canvas.getByRole('button', { name: 'Refresh timeline' }),
    );

    await expect(
      await canvas.findByRole('button', { name: 'Filter conversations' }),
    ).toBeVisible();
  },
};
