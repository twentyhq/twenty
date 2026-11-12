import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { EmptyInboxPlaceholder } from '@/activities/emails/components/EmptyInboxPlaceholder';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, within } from 'storybook/test';
import {
  ConnectedAccountProvider,
  StandardObjectNameSingular,
} from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

type MyConnectedAccount = Omit<
  ConnectedAccount,
  'messageChannels' | 'calendarChannels'
>;

const WHATSAPP_ACCOUNT: MyConnectedAccount = {
  id: '20202020-0000-4000-8000-0000000000a1',
  handle: '+33 6 00 00 00 00',
  provider: ConnectedAccountProvider.APP,
  authFailedAt: null,
  authFailedReason: null,
  archivedAt: null,
  scopes: null,
  handleAliases: null,
  lastSignedInAt: null,
  userWorkspaceId: 'user-workspace-id',
  connectionProviderId: 'connection-provider-id',
  applicationId: 'application-id',
  name: null,
  scope: 'USER',
  lastCredentialsRefreshedAt: null,
  connectionParameters: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  __typename: 'ConnectedAccount',
};

const WHATSAPP_CHANNEL = {
  __typename: 'MessageChannel',
  id: '20202020-0000-4000-8000-0000000000b1',
  handle: '+33 6 00 00 00 00',
  displayName: null,
  visibility: 'SHARE_EVERYTHING',
  type: 'APP',
  isContactAutoCreationEnabled: false,
  contactAutoCreationPolicy: 'NONE',
  messageFolderImportPolicy: 'ALL_FOLDERS',
  excludeNonProfessionalEmails: false,
  excludeGroupEmails: false,
  isSyncEnabled: true,
  messagingProviderUniversalIdentifier: null,
  syncStatus: 'ACTIVE',
  syncStage: 'MESSAGE_LIST_FETCH_PENDING',
  syncStageStartedAt: null,
  importProgress: null,
  connectedAccountId: WHATSAPP_ACCOUNT.id,
  connectedAccount: {
    __typename: 'ConnectedAccount',
    id: WHATSAPP_ACCOUNT.id,
    handle: WHATSAPP_ACCOUNT.handle,
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockMessageChannels = (
  resolveMessageChannels: () => (typeof WHATSAPP_CHANNEL)[] | null,
) => ({
  handlers: [
    graphql.query('MyMessageChannels', () => {
      const myMessageChannels = resolveMessageChannels();

      return myMessageChannels === null
        ? HttpResponse.json({
            errors: [{ message: 'Internal server error' }],
            data: null,
          })
        : HttpResponse.json({ data: { myMessageChannels } });
    }),
    ...graphqlMocks.handlers,
  ],
});

const meta: Meta<typeof EmptyInboxPlaceholder> = {
  title: 'Modules/Activities/Emails/EmptyInboxPlaceholder',
  component: EmptyInboxPlaceholder,
  decorators: [
    (Story) => (
      <LayoutRenderingProvider
        value={{
          layoutType: PageLayoutType.RECORD_PAGE,
          targetRecordIdentifier: {
            id: 'story-company',
            targetObjectNameSingular: StandardObjectNameSingular.Company,
          },
        }}
      >
        <Story />
      </LayoutRenderingProvider>
    ),
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    MemoryRouterDecorator,
    ToastDecorator,
  ],
  parameters: {
    container: { width: 360 },
    msw: mockMessageChannels(() => []),
  },
  beforeEach: async () => {
    jotaiStore.set(myConnectedAccountsState.atom, []);
    await mockedApolloClient.clearStore();
  },
};

export default meta;
type Story = StoryObj<typeof EmptyInboxPlaceholder>;

export const NoAccount: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('button', { name: 'Connect an account' }),
    ).toBeVisible();

    const description = canvas.getByText(
      'Connect email, WhatsApp or LinkedIn to see your conversations here.',
    );

    await expect(description.scrollHeight).toBeLessThanOrEqual(
      description.clientHeight,
    );
  },
};

export const MessagingAccount: Story = {
  parameters: { msw: mockMessageChannels(() => [WHATSAPP_CHANNEL]) },
  beforeEach: () => {
    jotaiStore.set(myConnectedAccountsState.atom, [WHATSAPP_ACCOUNT]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText('Your conversations will show up here.'),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Connect an account' }),
    ).not.toBeInTheDocument();
  },
};

export const DisconnectedAccount: Story = {
  parameters: { msw: mockMessageChannels(() => [WHATSAPP_CHANNEL]) },
  beforeEach: () => {
    jotaiStore.set(myConnectedAccountsState.atom, [
      { ...WHATSAPP_ACCOUNT, authFailedAt: '2026-11-01T00:00:00.000Z' },
    ]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('button', { name: 'Connect an account' }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Link email threads' }),
    ).not.toBeInTheDocument();
  },
};

export const LoadingAccounts: Story = {
  beforeEach: () => {
    jotaiStore.set(myConnectedAccountsState.atom, null);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText('No messages yet')).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Connect an account' }),
    ).not.toBeInTheDocument();
  },
};

let channelsRequestCount = 0;

export const ChannelsLoadError: Story = {
  parameters: {
    msw: mockMessageChannels(() => {
      channelsRequestCount += 1;

      return channelsRequestCount === 1 ? null : [WHATSAPP_CHANNEL];
    }),
  },
  beforeEach: () => {
    channelsRequestCount = 0;
    jotaiStore.set(myConnectedAccountsState.atom, [WHATSAPP_ACCOUNT]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText("We couldn't load the messages"),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Connect an account' }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));

    await expect(
      await canvas.findByText('Your conversations will show up here.'),
    ).toBeVisible();
  },
};
