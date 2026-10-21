import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, delay, graphql, http } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
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
  FATHOM_ONLY_ACCOUNT_ID,
  GOOGLE_ACCOUNT_ID,
  GRANOLA_APPLICATION_ID,
  MY_USER_WORKSPACE_ID,
  buildConnectedAccount,
  MICROSOFT_ACCOUNT_ID,
  deleteConnectedAccount,
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
  LINEAR_CONNECTIONS_REDIRECT_LOCATION,
  LINEAR_RECONNECT_NEEDED_ACCOUNT_ID,
  MOCKED_TRANSIENT_TOKEN,
} from '~/pages/settings/accounts/__stories__/mockedLinearApplicationPreferences';
import { clickAndCaptureOAuthRedirect } from '~/pages/settings/accounts/__stories__/clickAndCaptureOAuthRedirect';
import { withinTableRowOrThrow } from '~/pages/settings/accounts/__stories__/withinTableRowOrThrow';

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

export const DeleteKeepsAppConnections: Story = {
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

    const remainingRow = await waitFor(() =>
      withinTableRowOrThrow({ canvasElement, text: 'Tim@Apple.dev' }),
    );

    expect(remainingRow.getByRole('img', { name: 'Fathom' })).toBeVisible();
    expect(
      remainingRow.getByRole('button', { name: 'More options' }),
    ).toBeVisible();
    expect(canvas.queryByText('tim@apple.dev')).not.toBeInTheDocument();
    expect(deleteConnectedAccount.mock.calls).toEqual([[GOOGLE_ACCOUNT_ID]]);
    expect(canvas.queryByText(/Navigated to/)).not.toBeInTheDocument();
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
        graphql.query('MyConnectedAccounts', () =>
          HttpResponse.json({
            data: {
              myConnectedAccounts: [
                ...CONNECTED_ACCOUNTS,
                buildConnectedAccount({
                  id: '20202020-1a2b-4c3d-8e4f-000000000019',
                  handle: GRANOLA_ONLY_ACCOUNT_HANDLE,
                  provider: 'app',
                  userWorkspaceId: MY_USER_WORKSPACE_ID,
                  applicationId: GRANOLA_APPLICATION_ID,
                }),
              ],
            },
          }),
        ),
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

export const AppOnlyAccountRowMenuDisconnects: Story = {
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

    expect(
      body.queryByRole('menuitem', { name: 'Reconnect' }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Disconnect' }),
    );

    const requestsBeforeDisconnect =
      myApplicationPreferencesRequested.mock.calls.length;

    await userEvent.click(
      await body.findByRole('button', { name: /^Disconnect$/ }),
    );

    await waitFor(() =>
      expect(deleteConnectedAccount.mock.calls).toEqual([
        [FATHOM_ONLY_ACCOUNT_ID],
      ]),
    );
    // The row unmounts before the second refetch lands; waiting for it keeps the next story's store reset from racing it
    await waitFor(() =>
      expect(
        myApplicationPreferencesRequested.mock.calls.length,
      ).toBeGreaterThan(requestsBeforeDisconnect),
    );
    await waitFor(() =>
      expect(canvas.queryByText('notes@apple.dev')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        body.queryByRole('button', { name: /^Disconnect$/ }),
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

    const reconnectNeededRow = withinTableRowOrThrow({
      canvasElement,
      text: 'tim.cook@linear.app',
    });

    expect(reconnectNeededRow.getByText('Reconnect needed')).toBeVisible();
    expect(
      withinTableRowOrThrow({
        canvasElement,
        text: 'old@linear.app',
      }).getByText('Reconnect needed'),
    ).toBeVisible();
    expect(
      withinTableRowOrThrow({
        canvasElement,
        text: 'legacy@linear.app',
      }).getByText('Reconnect needed'),
    ).toBeVisible();
    expect(
      canvas.getByRole('link', { name: /legacy@linear\.app/ }),
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
      scope: 'USER',
      visibility: 'user',
      reconnectingConnectedAccountId: LINEAR_RECONNECT_NEEDED_ACCOUNT_ID,
      redirectLocation: LINEAR_CONNECTIONS_REDIRECT_LOCATION,
    });
  },
};

export const AppsWithoutAccountShowMissingAccount: Story = {
  ...accountGroupsStory,
  parameters: {
    msw: {
      handlers: [
        graphql.query('MyConnectedAccounts', () =>
          HttpResponse.json({
            data: {
              myConnectedAccounts: CONNECTED_ACCOUNTS.filter(
                (account) =>
                  account.id !== GOOGLE_ACCOUNT_ID &&
                  account.id !== MICROSOFT_ACCOUNT_ID,
              ),
            },
          }),
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
        /Missing/,
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
