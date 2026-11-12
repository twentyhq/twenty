import { timelineThreadChannelFilterFamilyState } from '@/activities/emails/states/timelineThreadChannelFilterFamilyState';
import { WidgetActionMessagesFilter } from '@/page-layout/widgets/messages/components/WidgetActionMessagesFilter';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { StandardObjectNameSingular } from 'twenty-shared/types';
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

const getTimelineThreadChannelFilter = () =>
  jotaiStore.get(
    timelineThreadChannelFilterFamilyState.atomFamily(TARGET_RECORD_ID),
  );

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
              getTimelineThreadChannelsFromObjectRecord: [
                GMAIL_CHANNEL,
                OUTLOOK_CHANNEL,
              ],
            },
          }),
        ),
      ],
    },
  },
  beforeEach: async () => {
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
    await userEvent.click(
      await within(canvasElement).findByRole(
        'button',
        { name: 'Filter conversations' },
        { timeout: 3000 },
      ),
    );

    const menu = within(document.body);

    await expect(
      await menu.findByRole('menuitemradio', { name: 'All conversations' }),
    ).toBeVisible();

    await userEvent.click(menu.getByRole('menuitemradio', { name: /Outlook/ }));

    await waitFor(() =>
      expect(getTimelineThreadChannelFilter()).toEqual({
        type: MessageChannelType.EMAIL,
        provider: 'microsoft',
        applicationId: null,
      }),
    );
    await expect(
      within(canvasElement).getByRole('button', {
        name: 'Filter conversations · Outlook',
      }),
    ).toBeVisible();
  },
};
