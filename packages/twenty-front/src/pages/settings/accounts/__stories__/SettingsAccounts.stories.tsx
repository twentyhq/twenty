import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, delay, graphql, http } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { ToastStoryContainer } from '~/testing/components/ToastStoryContainer';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedClientConfig } from '~/testing/mock-data/config';

import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SettingsAccounts } from '~/pages/settings/accounts/SettingsAccounts';
import {
  ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
  CONNECTED_ACCOUNTS,
  FATHOM_APPLICATION_ID,
  FATHOM_ACCOUNT_ID,
  FATHOM_ONLY_ACCOUNT_ID,
  GOOGLE_ACCOUNT_ID,
  GRANOLA_APPLICATION_ID,
  MY_USER_WORKSPACE_ID,
  buildConnectedAccount,
  buildConnectedAccountsQueryHandler,
  MICROSOFT_ACCOUNT_ID,
  deleteConnectedAccount,
  disconnectConnectedAccount,
  failConnectedAccountAction,
  myConnectedAccountsRequested,
  myApplicationPreferencesRequested,
  seedAccountGroupsStory,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';
import {
  APPLICATION_PREFERENCES_DETAIL_GRAPHQL_HANDLERS,
  APPLICATION_PREFERENCES_GRAPHQL_HANDLERS,
  failNextApplicationPreferencesRequest,
  seedApplicationPreferencesStory,
} from '~/pages/settings/accounts/__stories__/mockedApplicationPreferences';
import {
  LINEAR_APPLICATION_ID,
  LINEAR_CONNECTION_PROVIDER_ID,
  LINEAR_CONNECTIONS_REDIRECT_LOCATION,
  LINEAR_RECONNECT_NEEDED_ACCOUNT_ID,
  MOCKED_TRANSIENT_TOKEN,
  unconfigureLinearClientCredentials,
} from '~/pages/settings/accounts/__stories__/mockedLinearApplicationPreferences';
import { clickAndCaptureOAuthRedirect } from '~/pages/settings/accounts/__stories__/clickAndCaptureOAuthRedirect';
import { expectReconnectNeededWithoutReconnectAction } from '~/pages/settings/accounts/__stories__/expectReconnectNeededWithoutReconnectAction';
import { withinTableRowOrThrow } from '~/testing/utils/withinTableRowOrThrow';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsAccounts',
  component: SettingsAccounts,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/accounts',
  },
  parameters: {
    layout: 'fullscreen',
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAccounts>;

const accountGroupsStory: Story = {
  args: {
    additionalRoutes: ['/settings/accounts/detail/:connectedAccountId'],
  },
  beforeEach: seedAccountGroupsStory,
  parameters: {
    msw: { handlers: ACCOUNT_GROUPS_GRAPHQL_HANDLERS },
  },
};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Connected accounts', undefined, {
      timeout: 3000,
    });

    expect(canvas.queryByText('App preferences')).not.toBeInTheDocument();
  },
};

export const AccountsGroupedByEmail: Story = {
  ...accountGroupsStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim@apple.dev', undefined, { timeout: 3000 });

    expect(canvas.getAllByText('App preferences').length).toBeGreaterThan(0);
    expect(canvas.queryByText('Connected accounts')).not.toBeInTheDocument();

    const timRow = withinTableRowOrThrow({
      canvasElement,
      text: 'tim@apple.dev',
    });

    expect(
      timRow.getAllByRole('img', { name: 'Gmail and Calendar' }),
    ).toHaveLength(1);
    expect(timRow.getByRole('img', { name: 'Fathom' })).toBeVisible();
    expect(
      timRow.queryByRole('img', { name: 'Granola' }),
    ).not.toBeInTheDocument();
    expect(canvas.getByRole('link', { name: 'tim@apple.dev' })).toHaveAttribute(
      'href',
      `/settings/accounts/detail/${GOOGLE_ACCOUNT_ID}`,
    );
    expect(canvas.queryByText('Tim@Apple.dev')).not.toBeInTheDocument();

    const outlookRow = withinTableRowOrThrow({
      canvasElement,
      text: 'tim@outlook.com',
    });

    expect(outlookRow.getAllByRole('img', { name: 'Outlook' })).toHaveLength(1);

    const notesRow = withinTableRowOrThrow({
      canvasElement,
      text: 'notes@apple.dev',
    });

    expect(notesRow.getByRole('img', { name: 'Fathom' })).toBeVisible();
    expect(
      notesRow.queryByRole('img', { name: 'Gmail and Calendar' }),
    ).not.toBeInTheDocument();
    expect(
      notesRow.getByRole('button', { name: 'More options' }),
    ).toBeVisible();
    expect(notesRow.queryByText('Reconnect needed')).not.toBeInTheDocument();

    expect(canvas.queryByText('support@apple.dev')).not.toBeInTheDocument();
  },
};

export const WorkspaceSharedAppConnectionsStayOff: Story = {
  ...accountGroupsStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim@apple.dev', undefined, { timeout: 3000 });

    expect(canvas.queryByText('sales@apple.dev')).not.toBeInTheDocument();
    expect(
      withinTableRowOrThrow({
        canvasElement,
        text: 'tim@apple.dev',
      }).queryByRole('img', {
        name: 'Granola',
      }),
    ).not.toBeInTheDocument();
  },
};

export const AccountsHeaderStaysWhileLoading: Story = {
  ...accountGroupsStory,
  parameters: {
    msw: {
      handlers: [
        graphql.query('MyConnectedAccounts', async () => {
          await delay('infinite');
        }),
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Shared accounts between apps', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
    expect(canvas.getByText('Accounts')).toBeVisible();
    expect(
      canvas.getByText(
        'Choose your preferences for the apps installed on your workspace by the admin',
      ),
    ).toBeVisible();
    expect(canvas.getByText('Used by')).toBeVisible();
    expect(canvasElement.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(canvas.queryByText('tim@apple.dev')).not.toBeInTheDocument();
  },
};

export const AppPreferencesListEnabledApps: Story = {
  ...accountGroupsStory,
  args: {
    additionalRoutes: ['/settings/accounts/apps/outlook'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(
      'Choose your preferences for the apps installed on your workspace by the admin',
      undefined,
      { timeout: 3000 },
    );
    await canvas.findByText('tim@apple.dev');

    expect(
      canvas.getByRole('link', { name: 'Gmail and Calendar' }),
    ).toBeVisible();
    expect(canvas.queryByText('IMAP')).not.toBeInTheDocument();
    expect(canvas.queryByText('Missing account')).not.toBeInTheDocument();
    expect(canvas.queryByText('Blocklist')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('link', { name: 'Outlook' }));

    expect(
      await canvas.findByText('Navigated to /settings/accounts/apps/outlook'),
    ).toBeVisible();
  },
};

export const RowOpensAccountPage: Story = {
  ...accountGroupsStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim@apple.dev', undefined, { timeout: 3000 });
    await userEvent.click(
      withinTableRowOrThrow({ canvasElement, text: 'tim@apple.dev' }).getByRole(
        'img',
        {
          name: 'Gmail and Calendar',
        },
      ),
    );

    expect(
      await canvas.findByText(
        'Navigated to /settings/accounts/detail/:connectedAccountId',
      ),
    ).toBeVisible();
  },
};

export const DeleteRemovesWholeAccountGroup: Story = {
  ...accountGroupsStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await canvas.findByText('tim@apple.dev', undefined, { timeout: 3000 });

    const openDeleteDialog = async () => {
      await userEvent.click(
        withinTableRowOrThrow({
          canvasElement,
          text: 'tim@apple.dev',
        }).getByRole('button', {
          name: 'More options',
        }),
      );
      expect(body.queryByText('Emails settings')).not.toBeInTheDocument();
      await userEvent.click(
        await body.findByText('Delete account and synced data'),
      );
    };

    await openDeleteDialog();
    await userEvent.click(await body.findByRole('button', { name: /Cancel/ }));

    expect(canvas.queryByText(/Navigated to/)).not.toBeInTheDocument();

    await openDeleteDialog();
    await userEvent.click(
      await body.findByRole('button', { name: /Delete account and data/ }),
    );

    await waitFor(() =>
      expect(canvas.queryByText('tim@apple.dev')).not.toBeInTheDocument(),
    );
    expect(canvas.queryByText('Tim@Apple.dev')).not.toBeInTheDocument();
    expect(deleteConnectedAccount.mock.calls).toEqual(
      expect.arrayContaining([[GOOGLE_ACCOUNT_ID], [FATHOM_ACCOUNT_ID]]),
    );
    expect(deleteConnectedAccount).toHaveBeenCalledTimes(2);
    expect(disconnectConnectedAccount).not.toHaveBeenCalled();
    expect(canvas.queryByText(/Navigated to/)).not.toBeInTheDocument();
  },
};

const MIXED_LINEAR_ACCOUNT_ID = '20202020-1a2b-4c3d-8e4f-000000000093';
const MIXED_ARCHIVED_LINEAR_ACCOUNT_ID = '20202020-1a2b-4c3d-8e4f-000000000094';
const MIXED_GROUP_ACCOUNTS = [
  ...CONNECTED_ACCOUNTS,
  buildConnectedAccount({
    id: MIXED_LINEAR_ACCOUNT_ID,
    handle: 'TIM@APPLE.DEV',
    name: 'Personal workspace',
    provider: 'app',
    userWorkspaceId: MY_USER_WORKSPACE_ID,
    applicationId: LINEAR_APPLICATION_ID,
    connectionProviderId: LINEAR_CONNECTION_PROVIDER_ID,
    authFailedAt: '2026-09-02T00:00:00.000Z',
  }),
  buildConnectedAccount({
    id: MIXED_ARCHIVED_LINEAR_ACCOUNT_ID,
    handle: 'tim@apple.dev',
    name: 'Archived workspace',
    provider: 'app',
    userWorkspaceId: MY_USER_WORKSPACE_ID,
    applicationId: LINEAR_APPLICATION_ID,
    connectionProviderId: LINEAR_CONNECTION_PROVIDER_ID,
    archivedAt: '2026-09-03T00:00:00.000Z',
  }),
];
const MIXED_GROUP_ACTIVE_ACCOUNT_IDS = [
  GOOGLE_ACCOUNT_ID,
  FATHOM_ACCOUNT_ID,
  MIXED_LINEAR_ACCOUNT_ID,
];
const mixedAccountGroupStory: Story = {
  ...accountGroupsStory,
  decorators: [
    (Story) => (
      <ToastStoryContainer>
        <Story />
      </ToastStoryContainer>
    ),
  ],
  beforeEach: seedApplicationPreferencesStory,
  parameters: {
    msw: {
      handlers: [
        buildConnectedAccountsQueryHandler(MIXED_GROUP_ACCOUNTS),
        ...APPLICATION_PREFERENCES_GRAPHQL_HANDLERS,
      ],
    },
  },
};

const openMixedAccountGroupAction = async ({
  canvasElement,
  action,
  handle = 'tim@apple.dev',
}: {
  canvasElement: HTMLElement;
  action: 'Disconnect account' | 'Delete account and synced data';
  handle?: string;
}) => {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);

  await canvas.findByText(handle, undefined, { timeout: 3000 });
  await canvas.findByText('Linear', undefined, { timeout: 3000 });
  await userEvent.click(
    withinTableRowOrThrow({ canvasElement, text: handle }).getByRole('button', {
      name: 'More options',
    }),
  );
  await userEvent.click(await body.findByRole('menuitem', { name: action }));

  return within(
    await body.findByRole('dialog', {
      name:
        action === 'Disconnect account'
          ? 'Disconnect account'
          : 'Delete account and synced data?',
    }),
  );
};

export const MixedGroupReconnectTargetsEligibleAppIdentity: Story = {
  ...mixedAccountGroupStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await canvas.findByText('tim@apple.dev', undefined, { timeout: 3000 });
    await canvas.findByText('Linear', undefined, { timeout: 3000 });
    await userEvent.click(
      withinTableRowOrThrow({ canvasElement, text: 'tim@apple.dev' }).getByRole(
        'button',
        { name: 'More options' },
      ),
    );

    expect(
      body.queryByRole('menuitem', { name: /Reconnect.*Archived workspace/ }),
    ).not.toBeInTheDocument();
    const redirectUrl = await clickAndCaptureOAuthRedirect(
      await body.findByRole('menuitem', {
        name: 'Reconnect Linear (Personal workspace)',
      }),
    );

    expect(Object.fromEntries(redirectUrl.searchParams)).toEqual({
      applicationId: LINEAR_APPLICATION_ID,
      providerName: 'linear',
      transientToken: MOCKED_TRANSIENT_TOKEN,
      reconnectingConnectedAccountId: MIXED_LINEAR_ACCOUNT_ID,
      redirectLocation: LINEAR_CONNECTIONS_REDIRECT_LOCATION,
    });
    expect(deleteConnectedAccount).not.toHaveBeenCalled();
    expect(disconnectConnectedAccount).not.toHaveBeenCalled();
  },
};

export const DisconnectArchivesEveryActiveConnectionInMixedGroup: Story = {
  ...mixedAccountGroupStory,
  play: async ({ canvasElement }) => {
    const dialog = await openMixedAccountGroupAction({
      canvasElement,
      action: 'Disconnect account',
    });

    expect(dialog.getByText('Gmail and Calendar')).toBeVisible();
    expect(dialog.getByText(/Fathom:/)).toBeVisible();
    expect(dialog.getByText(/Personal workspace/)).toBeVisible();
    expect(dialog.queryByText(/Archived workspace/)).not.toBeInTheDocument();
    expect(dialog.getByText(/retained/)).toBeVisible();

    await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
    expect(disconnectConnectedAccount).not.toHaveBeenCalled();

    const confirmedDialog = await openMixedAccountGroupAction({
      canvasElement,
      action: 'Disconnect account',
    });
    myConnectedAccountsRequested.mockClear();
    await userEvent.click(
      confirmedDialog.getByRole('button', { name: 'Disconnect account' }),
    );

    await waitFor(() => {
      expect(
        disconnectConnectedAccount.mock.calls.map(([id]) => id).sort(),
      ).toEqual([...MIXED_GROUP_ACTIVE_ACCOUNT_IDS].sort());
      expect(myConnectedAccountsRequested).toHaveBeenCalled();
    });
    expect(deleteConnectedAccount).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(
        withinTableRowOrThrow({
          canvasElement,
          text: 'tim@apple.dev',
        }).getByText('Sync paused'),
      ).toBeVisible(),
    );
    const body = within(canvasElement.ownerDocument.body);

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(
      withinTableRowOrThrow({ canvasElement, text: 'tim@apple.dev' }).getByRole(
        'button',
        { name: 'More options' },
      ),
    );
    expect(
      body.queryByRole('menuitem', { name: 'Disconnect account' }),
    ).not.toBeInTheDocument();
    expect(
      body.getByRole('menuitem', { name: 'Delete account and synced data' }),
    ).toBeVisible();
  },
};

export const DeleteRemovesArchivedAndActiveConnectionsInMixedGroup: Story = {
  ...mixedAccountGroupStory,
  play: async ({ canvasElement }) => {
    const dialog = await openMixedAccountGroupAction({
      canvasElement,
      action: 'Delete account and synced data',
    });

    expect(dialog.getByText('Gmail and Calendar')).toBeVisible();
    expect(dialog.getByText(/Fathom:/)).toBeVisible();
    expect(dialog.getByText(/Personal workspace/)).toBeVisible();
    expect(dialog.getByText(/Archived workspace/)).toBeVisible();
    expect(dialog.getByText(/permanently/)).toBeVisible();
    myConnectedAccountsRequested.mockClear();

    await userEvent.click(
      dialog.getByRole('button', { name: 'Delete account and data' }),
    );

    await waitFor(() => {
      expect(
        deleteConnectedAccount.mock.calls.map(([id]) => id).sort(),
      ).toEqual(
        [
          ...MIXED_GROUP_ACTIVE_ACCOUNT_IDS,
          MIXED_ARCHIVED_LINEAR_ACCOUNT_ID,
        ].sort(),
      );
      expect(myConnectedAccountsRequested).toHaveBeenCalled();
      expect(
        within(canvasElement).queryByText('tim@apple.dev'),
      ).not.toBeInTheDocument();
      expect(within(canvasElement).getByText('notes@apple.dev')).toBeVisible();
      expect(within(canvasElement).getByText('tim@outlook.com')).toBeVisible();
    });
    expect(disconnectConnectedAccount).not.toHaveBeenCalled();
  },
};

export const PartialDisconnectRefetchesAndReportsFailedConnection: Story = {
  ...mixedAccountGroupStory,
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    failConnectedAccountAction({
      action: 'disconnect',
      accountId: MIXED_LINEAR_ACCOUNT_ID,
    });
  },
  play: async ({ canvasElement }) => {
    const dialog = await openMixedAccountGroupAction({
      canvasElement,
      action: 'Disconnect account',
    });
    myConnectedAccountsRequested.mockClear();
    await userEvent.click(
      dialog.getByRole('button', { name: 'Disconnect account' }),
    );
    const body = within(canvasElement.ownerDocument.body);

    expect(
      await body.findByText(
        'Disconnected 2 of 3 connections. Could not disconnect: Linear: Personal workspace.',
      ),
    ).toBeVisible();
    await waitFor(() => {
      expect(myConnectedAccountsRequested).toHaveBeenCalled();
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(
      disconnectConnectedAccount.mock.calls.map(([id]) => id).sort(),
    ).toEqual([...MIXED_GROUP_ACTIVE_ACCOUNT_IDS].sort());
    expect(deleteConnectedAccount).not.toHaveBeenCalled();

    const remainingDialog = await openMixedAccountGroupAction({
      canvasElement,
      action: 'Disconnect account',
    });

    expect(
      remainingDialog.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual(['Linear: Personal workspace']);
  },
};

export const PartialDeleteRefetchesAndReportsFailedConnection: Story = {
  ...mixedAccountGroupStory,
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    failConnectedAccountAction({
      action: 'delete',
      accountId: MIXED_LINEAR_ACCOUNT_ID,
    });
  },
  play: async ({ canvasElement }) => {
    const dialog = await openMixedAccountGroupAction({
      canvasElement,
      action: 'Delete account and synced data',
    });
    myConnectedAccountsRequested.mockClear();
    await userEvent.click(
      dialog.getByRole('button', { name: 'Delete account and data' }),
    );
    const body = within(canvasElement.ownerDocument.body);

    expect(
      await body.findByText(
        'Deleted 3 of 4 connections. Could not delete: Linear: Personal workspace.',
      ),
    ).toBeVisible();
    await waitFor(() => {
      expect(myConnectedAccountsRequested).toHaveBeenCalled();
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(deleteConnectedAccount.mock.calls.map(([id]) => id).sort()).toEqual(
      [
        ...MIXED_GROUP_ACTIVE_ACCOUNT_IDS,
        MIXED_ARCHIVED_LINEAR_ACCOUNT_ID,
      ].sort(),
    );
    expect(disconnectConnectedAccount).not.toHaveBeenCalled();

    const remainingDialog = await openMixedAccountGroupAction({
      canvasElement,
      action: 'Delete account and synced data',
      handle: 'TIM@APPLE.DEV',
    });

    expect(
      remainingDialog.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual(['Linear: Personal workspace']);
  },
};

export const MailboxOnlyGroupKeepsAccountSettings: Story = {
  ...accountGroupsStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await canvas.findByText('tim@outlook.com', undefined, { timeout: 3000 });
    await userEvent.click(
      withinTableRowOrThrow({
        canvasElement,
        text: 'tim@outlook.com',
      }).getByRole('button', { name: 'More options' }),
    );
    const accountSettings = await body.findByRole('menuitem', {
      name: 'Account settings',
    });

    expect(accountSettings).toHaveAttribute(
      'href',
      `/settings/accounts/detail/${MICROSOFT_ACCOUNT_ID}`,
    );
    await userEvent.click(accountSettings);
    expect(
      await canvas.findByText(
        'Navigated to /settings/accounts/detail/:connectedAccountId',
      ),
    ).toBeVisible();
  },
};

export const MailboxOnlyGroupDisconnectsAndDeletesItsMailbox: Story = {
  ...accountGroupsStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const openRowMenu = () =>
      userEvent.click(
        withinTableRowOrThrow({
          canvasElement,
          text: 'tim@outlook.com',
        }).getByRole('button', { name: 'More options' }),
      );

    await canvas.findByText('tim@outlook.com', undefined, { timeout: 3000 });
    await openRowMenu();
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Disconnect account' }),
    );
    const disconnectDialog = within(
      await body.findByRole('dialog', { name: 'Disconnect account' }),
    );

    expect(
      disconnectDialog.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual(['Outlook']);
    await userEvent.click(
      disconnectDialog.getByRole('button', { name: 'Disconnect account' }),
    );
    await waitFor(() => {
      expect(disconnectConnectedAccount.mock.calls).toEqual([
        [MICROSOFT_ACCOUNT_ID],
      ]);
      expect(
        withinTableRowOrThrow({
          canvasElement,
          text: 'tim@outlook.com',
        }).getByText('Sync paused'),
      ).toBeVisible();
    });
    expect(deleteConnectedAccount).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    await openRowMenu();
    expect(
      body.queryByRole('menuitem', { name: 'Disconnect account' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      body.getByRole('menuitem', { name: 'Delete account and synced data' }),
    );
    const deleteDialog = within(
      await body.findByRole('dialog', {
        name: 'Delete account and synced data?',
      }),
    );

    await userEvent.click(
      deleteDialog.getByRole('button', { name: 'Delete account and data' }),
    );
    await waitFor(() => {
      expect(deleteConnectedAccount.mock.calls).toEqual([
        [MICROSOFT_ACCOUNT_ID],
      ]);
      expect(canvas.queryByText('tim@outlook.com')).not.toBeInTheDocument();
      expect(canvas.getByText('tim@apple.dev')).toBeVisible();
    });
  },
};

export const AppOnlyAccountRowOpensItsAppConnections: Story = {
  ...accountGroupsStory,
  args: {
    additionalRoutes: ['/settings/accounts/applications/:applicationId'],
  },
  beforeEach: seedApplicationPreferencesStory,
  parameters: {
    msw: { handlers: APPLICATION_PREFERENCES_GRAPHQL_HANDLERS },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole(
        'link',
        { name: /notes@apple\.dev/ },
        { timeout: 3000 },
      ),
    ).toHaveAttribute(
      'href',
      `/settings/accounts/applications/${FATHOM_APPLICATION_ID}#connections`,
    );

    await userEvent.click(
      withinTableRowOrThrow({
        canvasElement,
        text: 'notes@apple.dev',
      }).getByText('notes@apple.dev'),
    );

    expect(
      await canvas.findByText(
        'Navigated to /settings/accounts/applications/:applicationId',
      ),
    ).toBeVisible();
  },
};

const GRANOLA_ONLY_ACCOUNT_HANDLE = 'notes@granola.so';

export const AppOnlyAccountWithoutConnectionsTabHasNoLink: Story = {
  ...accountGroupsStory,
  beforeEach: seedApplicationPreferencesStory,
  parameters: {
    msw: {
      handlers: [
        buildConnectedAccountsQueryHandler([
          ...CONNECTED_ACCOUNTS,
          buildConnectedAccount({
            id: '20202020-1a2b-4c3d-8e4f-000000000019',
            handle: GRANOLA_ONLY_ACCOUNT_HANDLE,
            provider: 'app',
            userWorkspaceId: MY_USER_WORKSPACE_ID,
            applicationId: GRANOLA_APPLICATION_ID,
          }),
        ]),
        ...APPLICATION_PREFERENCES_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(GRANOLA_ONLY_ACCOUNT_HANDLE, undefined, {
      timeout: 3000,
    });
    await waitFor(() =>
      expect(myApplicationPreferencesRequested).toHaveBeenCalled(),
    );
    await canvas.findByText('Granola');

    expect(
      withinTableRowOrThrow({
        canvasElement,
        text: GRANOLA_ONLY_ACCOUNT_HANDLE,
      }).getByRole('button', { name: 'More options' }),
    ).toBeVisible();
    expect(
      canvas.queryByRole('link', { name: /notes@granola\.so/ }),
    ).not.toBeInTheDocument();
    expect(
      canvas.getByRole('link', { name: /notes@apple\.dev/ }),
    ).toHaveAttribute(
      'href',
      `/settings/accounts/applications/${FATHOM_APPLICATION_ID}#connections`,
    );
  },
};

export const AppOnlyAccountRowMenuDeletes: Story = {
  ...accountGroupsStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await canvas.findByText('notes@apple.dev', undefined, { timeout: 3000 });

    await userEvent.click(
      withinTableRowOrThrow({
        canvasElement,
        text: 'notes@apple.dev',
      }).getByRole('button', { name: 'More options' }),
    );

    const deleteMenuItem = await body.findByRole('menuitem', {
      name: 'Delete account and synced data',
    });

    expect(
      body.queryByRole('menuitem', { name: 'Reconnect' }),
    ).not.toBeInTheDocument();

    await userEvent.click(deleteMenuItem);
    await userEvent.click(
      await within(
        await body.findByRole('dialog', {
          name: 'Delete account and synced data?',
        }),
      ).findByRole('button', { name: 'Delete account and data' }),
    );

    await waitFor(() =>
      expect(deleteConnectedAccount.mock.calls).toEqual([
        [FATHOM_ONLY_ACCOUNT_ID],
      ]),
    );
    await waitFor(() =>
      expect(canvas.queryByText('notes@apple.dev')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Delete account and synced data?' }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const AppOnlyAccountNeedingReconnectIsFlagged: Story = {
  ...accountGroupsStory,
  beforeEach: seedApplicationPreferencesStory,
  parameters: {
    msw: { handlers: APPLICATION_PREFERENCES_DETAIL_GRAPHQL_HANDLERS },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await canvas.findByText('tim.cook@linear.app', undefined, {
      timeout: 3000,
    });
    await canvas.findByText('Linear', undefined, { timeout: 3000 });

    const reconnectNeededRow = withinTableRowOrThrow({
      canvasElement,
      text: 'tim.cook@linear.app',
    });

    expect(reconnectNeededRow.getByText('Reconnect needed')).toBeVisible();
    expect(
      withinTableRowOrThrow({ canvasElement, text: 'Linear' }).getByText(
        'Reconnect needed',
      ),
    ).toBeVisible();
    expect(
      withinTableRowOrThrow({ canvasElement, text: 'Fathom' }).getByText(
        'Missing configuration',
      ),
    ).toBeVisible();
    expect(
      withinTableRowOrThrow({
        canvasElement,
        text: 'tim@linear.app',
      }).queryByText('Reconnect needed'),
    ).not.toBeInTheDocument();
    expect(
      withinTableRowOrThrow({
        canvasElement,
        text: 'tim@linear.app',
      }).queryByText('Disconnected'),
    ).not.toBeInTheDocument();
    expect(
      canvas.getByRole('link', { name: /tim\.cook@linear\.app/ }),
    ).toHaveAttribute('href', LINEAR_CONNECTIONS_REDIRECT_LOCATION);

    await userEvent.click(
      reconnectNeededRow.getByRole('button', { name: 'More options' }),
    );

    const redirectUrl = await clickAndCaptureOAuthRedirect(
      await body.findByRole('menuitem', { name: 'Reconnect' }),
    );

    expect(`${redirectUrl.origin}${redirectUrl.pathname}`).toBe(
      `${REACT_APP_SERVER_BASE_URL}/auth/apps/authorize`,
    );
    expect(Object.fromEntries(redirectUrl.searchParams)).toEqual({
      applicationId: LINEAR_APPLICATION_ID,
      providerName: 'linear',
      transientToken: MOCKED_TRANSIENT_TOKEN,
      reconnectingConnectedAccountId: LINEAR_RECONNECT_NEEDED_ACCOUNT_ID,
      redirectLocation: LINEAR_CONNECTIONS_REDIRECT_LOCATION,
    });
  },
};

export const ArchivedAppOnlyAccountsShowDisconnected: Story = {
  ...accountGroupsStory,
  beforeEach: seedApplicationPreferencesStory,
  parameters: {
    msw: { handlers: APPLICATION_PREFERENCES_DETAIL_GRAPHQL_HANDLERS },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await canvas.findByText('left@linear.app', undefined, { timeout: 3000 });
    await canvas.findByText('Linear', undefined, { timeout: 3000 });

    for (const handle of ['old@linear.app', 'left@linear.app']) {
      const archivedRow = withinTableRowOrThrow({
        canvasElement,
        text: handle,
      });

      expect(archivedRow.getByText('Disconnected')).toBeVisible();
      expect(
        archivedRow.queryByText('Reconnect needed'),
      ).not.toBeInTheDocument();
    }

    await userEvent.click(
      withinTableRowOrThrow({
        canvasElement,
        text: 'left@linear.app',
      }).getByRole('button', { name: 'More options' }),
    );

    expect(
      await body.findByRole('menuitem', {
        name: 'Delete account and synced data',
      }),
    ).toBeVisible();
    expect(
      body.queryByRole('menuitem', { name: 'Disconnect account' }),
    ).not.toBeInTheDocument();
    expect(
      body.queryByRole('menuitem', { name: /Reconnect/ }),
    ).not.toBeInTheDocument();
  },
};

export const AppOnlyAccountNeedingReconnectWithoutOAuthIsFlaggedOnly: Story = {
  ...accountGroupsStory,
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    unconfigureLinearClientCredentials();
  },
  parameters: {
    msw: { handlers: APPLICATION_PREFERENCES_DETAIL_GRAPHQL_HANDLERS },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim.cook@linear.app', undefined, {
      timeout: 3000,
    });
    await canvas.findByText('Linear', undefined, { timeout: 3000 });

    await expectReconnectNeededWithoutReconnectAction({
      canvasElement,
      handle: 'tim.cook@linear.app',
      applicationName: 'Linear',
    });
  },
};

const TWO_LINEAR_CONNECTIONS_HANDLE = 'two.workspaces@linear.app';
const FIRST_LINEAR_CONNECTION_ID = '20202020-1a2b-4c3d-8e4f-000000000088';
const SECOND_LINEAR_CONNECTION_ID = '20202020-1a2b-4c3d-8e4f-000000000089';

export const AppOnlyAccountRowMenuNamesEachConnectionToOneApp: Story = {
  ...accountGroupsStory,
  beforeEach: seedApplicationPreferencesStory,
  parameters: {
    msw: {
      handlers: [
        buildConnectedAccountsQueryHandler([
          ...CONNECTED_ACCOUNTS,
          buildConnectedAccount({
            id: FIRST_LINEAR_CONNECTION_ID,
            handle: TWO_LINEAR_CONNECTIONS_HANDLE,
            name: 'Linear #1',
            provider: 'app',
            userWorkspaceId: MY_USER_WORKSPACE_ID,
            applicationId: LINEAR_APPLICATION_ID,
            connectionProviderId: LINEAR_CONNECTION_PROVIDER_ID,
            authFailedAt: '2026-09-02T00:00:00.000Z',
          }),
          buildConnectedAccount({
            id: SECOND_LINEAR_CONNECTION_ID,
            handle: TWO_LINEAR_CONNECTIONS_HANDLE,
            name: 'Linear #2',
            provider: 'app',
            userWorkspaceId: MY_USER_WORKSPACE_ID,
            applicationId: LINEAR_APPLICATION_ID,
            connectionProviderId: LINEAR_CONNECTION_PROVIDER_ID,
            archivedAt: '2026-09-03T00:00:00.000Z',
          }),
        ]),
        ...APPLICATION_PREFERENCES_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await canvas.findByText(TWO_LINEAR_CONNECTIONS_HANDLE, undefined, {
      timeout: 3000,
    });
    await canvas.findByText('Linear', undefined, { timeout: 3000 });

    const openRowMenu = () =>
      userEvent.click(
        withinTableRowOrThrow({
          canvasElement,
          text: TWO_LINEAR_CONNECTIONS_HANDLE,
        }).getByRole('button', { name: 'More options' }),
      );

    await openRowMenu();

    const redirectUrl = await clickAndCaptureOAuthRedirect(
      await body.findByRole('menuitem', {
        name: 'Reconnect Linear (Linear #1)',
      }),
    );

    expect(redirectUrl.searchParams.get('reconnectingConnectedAccountId')).toBe(
      FIRST_LINEAR_CONNECTION_ID,
    );

    await openRowMenu();

    expect(
      body.queryByRole('menuitem', { name: 'Reconnect Linear (Linear #2)' }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      await body.findByRole('menuitem', {
        name: 'Delete account and synced data',
      }),
    );

    const deleteDialog = within(
      await body.findByRole('dialog', {
        name: 'Delete account and synced data?',
      }),
    );

    expect(deleteDialog.getByText(/Linear #1/)).toBeVisible();
    expect(deleteDialog.getByText(/Linear #2/)).toBeVisible();

    await userEvent.click(
      deleteDialog.getByRole('button', { name: 'Delete account and data' }),
    );

    await waitFor(() => {
      expect(deleteConnectedAccount.mock.calls).toEqual(
        expect.arrayContaining([
          [FIRST_LINEAR_CONNECTION_ID],
          [SECOND_LINEAR_CONNECTION_ID],
        ]),
      );
      expect(deleteConnectedAccount).toHaveBeenCalledTimes(2);
    });
  },
};

const LINEAR_AND_FATHOM_HANDLE = 'meetings@linear.app';

export const AppOnlyAccountRowMenuNamesEachApp: Story = {
  ...accountGroupsStory,
  beforeEach: seedApplicationPreferencesStory,
  parameters: {
    msw: {
      handlers: [
        buildConnectedAccountsQueryHandler([
          ...CONNECTED_ACCOUNTS,
          buildConnectedAccount({
            id: '20202020-1a2b-4c3d-8e4f-000000000090',
            handle: LINEAR_AND_FATHOM_HANDLE,
            provider: 'app',
            userWorkspaceId: MY_USER_WORKSPACE_ID,
            applicationId: LINEAR_APPLICATION_ID,
            connectionProviderId: LINEAR_CONNECTION_PROVIDER_ID,
          }),
          buildConnectedAccount({
            id: '20202020-1a2b-4c3d-8e4f-000000000091',
            handle: LINEAR_AND_FATHOM_HANDLE,
            provider: 'app',
            userWorkspaceId: MY_USER_WORKSPACE_ID,
            applicationId: FATHOM_APPLICATION_ID,
          }),
        ]),
        ...APPLICATION_PREFERENCES_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await within(canvasElement).findByText(
      LINEAR_AND_FATHOM_HANDLE,
      undefined,
      { timeout: 3000 },
    );

    await userEvent.click(
      withinTableRowOrThrow({
        canvasElement,
        text: LINEAR_AND_FATHOM_HANDLE,
      }).getByRole('button', { name: 'More options' }),
    );

    expect(
      await body.findByRole('menuitem', { name: 'Disconnect account' }),
    ).toBeVisible();
    expect(
      body.getByRole('menuitem', { name: 'Delete account and synced data' }),
    ).toBeVisible();
    expect(
      body.queryByRole('menuitem', { name: /Remove/ }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      body.getByRole('menuitem', { name: 'Disconnect account' }),
    );
    const disconnectDialog = within(
      await body.findByRole('dialog', { name: 'Disconnect account' }),
    );

    expect(disconnectDialog.getByText(/Linear:/)).toBeVisible();
    expect(disconnectDialog.getByText(/Fathom:/)).toBeVisible();
    await userEvent.click(
      disconnectDialog.getByRole('button', { name: 'Disconnect account' }),
    );
    await waitFor(() => {
      expect(disconnectConnectedAccount.mock.calls).toEqual(
        expect.arrayContaining([
          ['20202020-1a2b-4c3d-8e4f-000000000090'],
          ['20202020-1a2b-4c3d-8e4f-000000000091'],
        ]),
      );
      expect(disconnectConnectedAccount).toHaveBeenCalledTimes(2);
    });
    expect(deleteConnectedAccount).not.toHaveBeenCalled();
  },
};

export const AppsWithoutAccountShowMissingAccount: Story = {
  ...accountGroupsStory,
  parameters: {
    msw: {
      handlers: [
        buildConnectedAccountsQueryHandler(
          CONNECTED_ACCOUNTS.filter(
            (account) =>
              account.id !== GOOGLE_ACCOUNT_ID &&
              account.id !== MICROSOFT_ACCOUNT_ID,
          ),
        ),
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(
      'Choose your preferences for the apps installed on your workspace by the admin',
      undefined,
      { timeout: 3000 },
    );

    expect(
      await withinTableRowOrThrow({
        canvasElement,
        text: 'Outlook',
      }).findByText('Missing account'),
    ).toBeVisible();
    expect(
      withinTableRowOrThrow({
        canvasElement,
        text: 'Gmail and Calendar',
      }).queryByText('Missing account'),
    ).not.toBeInTheDocument();
  },
};

export const BlocklistStaysWhenNoAppIsEnabled: Story = {
  ...accountGroupsStory,
  beforeEach: async () => {
    await seedAccountGroupsStory();
    jotaiStore.set(isGoogleMessagingEnabledState.atom, false);
    jotaiStore.set(isGoogleCalendarEnabledState.atom, false);
    jotaiStore.set(isMicrosoftMessagingEnabledState.atom, false);
    jotaiStore.set(isMicrosoftCalendarEnabledState.atom, false);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Blocklist', undefined, { timeout: 3000 }),
    ).toBeVisible();
    expect(
      canvas.queryByText(
        'Choose your preferences for the apps installed on your workspace by the admin',
      ),
    ).not.toBeInTheDocument();
  },
};

export const AppPreferencesListInstalledApps: Story = {
  ...accountGroupsStory,
  args: {
    additionalRoutes: ['/settings/accounts/applications/:applicationId'],
  },
  beforeEach: seedApplicationPreferencesStory,
  parameters: {
    msw: { handlers: APPLICATION_PREFERENCES_GRAPHQL_HANDLERS },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const fathomName = await canvas.findByText('Fathom', undefined, {
      timeout: 3000,
    });

    expect(fathomName.closest('a')).toHaveAttribute(
      'href',
      `/settings/accounts/applications/${FATHOM_APPLICATION_ID}`,
    );
    expect(canvas.getByText('Granola')).toBeVisible();
    expect(canvas.getByText('Linear')).toBeVisible();
    expect(canvas.queryByText('Blocklist')).not.toBeInTheDocument();

    const outlookRow = canvas
      .getByText('Outlook')
      .closest<HTMLElement>('[data-table-row]');
    const fathomRow = fathomName.closest<HTMLElement>('[data-table-row]');
    const granolaRow = canvas
      .getByText('Granola')
      .closest<HTMLElement>('[data-table-row]');

    if (
      !isDefined(outlookRow) ||
      !isDefined(fathomRow) ||
      !isDefined(granolaRow)
    ) {
      throw new Error('Missing app preferences rows');
    }

    expect(
      outlookRow.compareDocumentPosition(fathomRow) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      fathomRow.compareDocumentPosition(granolaRow) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      within(fathomRow).queryByText('Missing account'),
    ).not.toBeInTheDocument();

    await userEvent.click(fathomRow);

    expect(
      await canvas.findByText(
        'Navigated to /settings/accounts/applications/:applicationId',
      ),
    ).toBeVisible();
  },
};

export const AppPreferencesListFlagsMissingConfiguration: Story = {
  ...accountGroupsStory,
  beforeEach: seedApplicationPreferencesStory,
  parameters: {
    msw: { handlers: APPLICATION_PREFERENCES_GRAPHQL_HANDLERS },
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Fathom', undefined, {
      timeout: 3000,
    });

    expect(
      withinTableRowOrThrow({ canvasElement, text: 'Fathom' }).getByText(
        'Missing configuration',
      ),
    ).toBeVisible();
    expect(
      withinTableRowOrThrow({ canvasElement, text: 'Granola' }).queryByText(
        'Missing configuration',
      ),
    ).not.toBeInTheDocument();
    expect(
      withinTableRowOrThrow({ canvasElement, text: 'Linear' }).queryByText(
        'Missing configuration',
      ),
    ).not.toBeInTheDocument();
    expect(
      await withinTableRowOrThrow({ canvasElement, text: 'Linear' }).findByText(
        'Missing account',
      ),
    ).toBeVisible();
  },
};

export const AppsWhoseProviderIsNotSetUpShowNoMissingAccount: Story = {
  ...accountGroupsStory,
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    unconfigureLinearClientCredentials();
  },
  parameters: {
    msw: { handlers: APPLICATION_PREFERENCES_GRAPHQL_HANDLERS },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Linear', undefined, { timeout: 3000 });
    await canvas.findByText('tim@apple.dev');

    expect(
      withinTableRowOrThrow({ canvasElement, text: 'Linear' }).queryByText(
        'Missing account',
      ),
    ).not.toBeInTheDocument();
  },
};

export const AppPreferencesListLoadErrorOffersRetry: Story = {
  ...accountGroupsStory,
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    failNextApplicationPreferencesRequest();
  },
  parameters: {
    msw: { handlers: APPLICATION_PREFERENCES_GRAPHQL_HANDLERS },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Your installed apps could not be loaded. Check your connection and try again.',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(
      canvas.getByRole('link', { name: 'Gmail and Calendar' }),
    ).toBeVisible();
    expect(canvas.queryByText('Fathom')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));

    expect(
      await canvas.findByText('Fathom', undefined, { timeout: 3000 }),
    ).toBeVisible();
    expect(
      canvas.queryByText(
        'Your installed apps could not be loaded. Check your connection and try again.',
      ),
    ).not.toBeInTheDocument();
  },
};

export const InstalledAppsKeepBlocklistWhenNoBuiltInAccountAppIsEnabled: Story =
  {
    ...accountGroupsStory,
    beforeEach: async () => {
      await seedApplicationPreferencesStory();
      jotaiStore.set(isGoogleMessagingEnabledState.atom, false);
      jotaiStore.set(isGoogleCalendarEnabledState.atom, false);
      jotaiStore.set(isMicrosoftMessagingEnabledState.atom, false);
      jotaiStore.set(isMicrosoftCalendarEnabledState.atom, false);
    },
    parameters: {
      msw: {
        handlers: [
          // The client config can load after beforeEach and would re-enable them
          http.get(`${REACT_APP_SERVER_BASE_URL}/client-config`, () =>
            HttpResponse.json({
              ...mockedClientConfig,
              isGoogleMessagingEnabled: false,
              isGoogleCalendarEnabled: false,
              isMicrosoftMessagingEnabled: false,
              isMicrosoftCalendarEnabled: false,
            }),
          ),
          ...APPLICATION_PREFERENCES_GRAPHQL_HANDLERS,
        ],
      },
    },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);

      expect(
        await canvas.findByText('Fathom', undefined, { timeout: 3000 }),
      ).toBeVisible();
      expect(
        canvas.getByText(
          'Choose your preferences for the apps installed on your workspace by the admin',
        ),
      ).toBeVisible();
      expect(await canvas.findByText('Blocklist')).toBeVisible();
      expect(
        canvas.queryByRole('link', { name: 'Gmail and Calendar' }),
      ).not.toBeInTheDocument();
    },
  };
