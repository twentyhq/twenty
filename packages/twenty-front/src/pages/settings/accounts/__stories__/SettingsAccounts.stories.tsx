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
  FATHOM_ACCOUNT_ID,
  FATHOM_APPLICATION_ID,
  GOOGLE_ACCOUNT_ID,
  MICROSOFT_ACCOUNT_ID,
  deleteConnectedAccount,
  disconnectConnectedAccount,
  seedAccountGroupsStory,
  withoutDeletedAccounts,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';
import {
  APPLICATION_PREFERENCES_GRAPHQL_HANDLERS,
  failNextApplicationPreferencesRequest,
  seedApplicationPreferencesStory,
} from '~/pages/settings/accounts/__stories__/mockedApplicationPreferences';
import { unconfigureLinearClientCredentials } from '~/pages/settings/accounts/__stories__/mockedLinearApplicationPreferences';
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

const getTableRow = (canvasElement: HTMLElement, text: string) => {
  const row = within(canvasElement)
    .getByText(text)
    .closest<HTMLElement>('[data-table-row]');

  if (!isDefined(row)) {
    throw new Error(`No table row for ${text}`);
  }

  return within(row);
};

const getTab = ({
  canvasElement,
  tabId,
}: {
  canvasElement: HTMLElement;
  tabId: string;
}) => within(canvasElement).getByTestId(`tab-${tabId}`);

const openRowMenu = async ({
  canvasElement,
  text,
}: {
  canvasElement: HTMLElement;
  text: string;
}) => {
  await within(canvasElement).findByText(text, undefined, { timeout: 3000 });
  await userEvent.click(
    withinTableRowOrThrow({ canvasElement, text }).getByRole('button', {
      name: 'More options',
    }),
  );
};

const accountGroupsStory: Story = {
  args: {
    additionalRoutes: ['/settings/accounts/detail/:connectedAccountId'],
  },
  beforeEach: seedAccountGroupsStory,
  parameters: {
    msw: { handlers: ACCOUNT_GROUPS_GRAPHQL_HANDLERS },
  },
};

const accountsTabStory: Story = {
  ...accountGroupsStory,
  args: { ...accountGroupsStory.args, routeHash: '#accounts' },
};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Connected accounts', undefined, {
      timeout: 3000,
    });

    expect(canvas.queryByText('Apps preferences')).not.toBeInTheDocument();
  },
};

export const AppsTabOpensByDefault: Story = {
  ...accountGroupsStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Choose your preferences for the apps installed on your workspace by the admin',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(canvas.getByRole('heading', { name: 'Apps' })).toBeVisible();
    expect(
      canvas.queryByText('Shared accounts between apps'),
    ).not.toBeInTheDocument();

    await userEvent.click(getTab({ canvasElement, tabId: 'accounts' }));

    expect(await canvas.findByText('tim@apple.dev')).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Add account' }),
    ).not.toBeInTheDocument();
  },
};

export const AccountsGroupedByEmail: Story = {
  ...accountsTabStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim@apple.dev', undefined, { timeout: 3000 });

    expect(canvas.getAllByText('Apps preferences').length).toBeGreaterThan(0);
    expect(canvas.queryByText('Connected accounts')).not.toBeInTheDocument();

    const timRow = getTableRow(canvasElement, 'tim@apple.dev');

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

    const outlookRow = getTableRow(canvasElement, 'tim@outlook.com');

    expect(outlookRow.getAllByRole('img', { name: 'Outlook' })).toHaveLength(1);

    const notesRow = getTableRow(canvasElement, 'notes@apple.dev');

    expect(notesRow.getByRole('img', { name: 'Fathom' })).toBeVisible();
    expect(
      notesRow.queryByRole('img', { name: 'Gmail and Calendar' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('link', { name: 'notes@apple.dev' }),
    ).not.toBeInTheDocument();

    expect(canvas.queryByText('support@apple.dev')).not.toBeInTheDocument();
  },
};

export const WorkspaceSharedAppConnectionsStayOff: Story = {
  ...accountsTabStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim@apple.dev', undefined, { timeout: 3000 });

    expect(canvas.queryByText('sales@apple.dev')).not.toBeInTheDocument();
    expect(
      getTableRow(canvasElement, 'tim@apple.dev').queryByRole('img', {
        name: 'Granola',
      }),
    ).not.toBeInTheDocument();
  },
};

export const AccountsHeaderStaysWhileLoading: Story = {
  ...accountsTabStory,
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
    expect(canvas.getByRole('heading', { name: 'Accounts' })).toBeVisible();
    expect(canvas.getByText('Used by')).toBeVisible();
    expect(canvasElement.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(canvas.queryByText('tim@apple.dev')).not.toBeInTheDocument();
  },
};

export const AccountsTabWithoutAccountsSaysNoAccountsYet: Story = {
  ...accountsTabStory,
  parameters: {
    msw: {
      handlers: [
        graphql.query('MyConnectedAccounts', () =>
          HttpResponse.json({ data: { myConnectedAccounts: [] } }),
        ),
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('No accounts yet', undefined, { timeout: 3000 }),
    ).toBeVisible();
    expect(canvas.queryByText('Connect with Google')).not.toBeInTheDocument();
  },
};

export const AppPreferencesListEnabledApps: Story = {
  ...accountsTabStory,
  args: {
    ...accountsTabStory.args,
    additionalRoutes: ['/settings/accounts/apps/outlook'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim@apple.dev', undefined, { timeout: 3000 });
    expect(canvas.queryByText('Blocklist')).not.toBeInTheDocument();
    await userEvent.click(getTab({ canvasElement, tabId: 'apps' }));

    expect(
      await canvas.findByRole('link', { name: 'Gmail and Calendar' }),
    ).toBeVisible();
    expect(canvas.queryByText('IMAP')).not.toBeInTheDocument();
    expect(canvas.queryByText('Missing account')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('link', { name: 'Outlook' }));

    expect(
      await canvas.findByText('Navigated to /settings/accounts/apps/outlook'),
    ).toBeVisible();
  },
};

export const RowOpensAccountPage: Story = {
  ...accountsTabStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim@apple.dev', undefined, { timeout: 3000 });
    await userEvent.click(
      getTableRow(canvasElement, 'tim@apple.dev').getByRole('img', {
        name: 'Gmail and Calendar',
      }),
    );

    expect(
      await canvas.findByText(
        'Navigated to /settings/accounts/detail/:connectedAccountId',
      ),
    ).toBeVisible();
  },
};

export const DisconnectCoversEveryActiveConnection: Story = {
  ...accountsTabStory,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openRowMenu({ canvasElement, text: 'tim@apple.dev' });
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Disconnect account' }),
    );

    const dialog = within(
      await body.findByRole('dialog', { name: 'Disconnect account' }),
    );

    expect(dialog.getByText('tim@apple.dev')).toBeVisible();
    expect(dialog.getByText('Fathom')).toBeVisible();

    await userEvent.click(
      dialog.getByRole('button', { name: 'Disconnect account' }),
    );

    await waitFor(() =>
      expect(disconnectConnectedAccount).toHaveBeenCalledTimes(2),
    );
    expect(disconnectConnectedAccount).toHaveBeenCalledWith(GOOGLE_ACCOUNT_ID);
    expect(disconnectConnectedAccount).toHaveBeenCalledWith(FATHOM_ACCOUNT_ID);
  },
};

export const DeleteAlsoRemovesArchivedConnections: Story = {
  ...accountsTabStory,
  parameters: {
    msw: {
      handlers: [
        graphql.query('MyConnectedAccounts', () =>
          HttpResponse.json({
            data: {
              myConnectedAccounts: withoutDeletedAccounts(
                CONNECTED_ACCOUNTS.map((account) =>
                  account.id === FATHOM_ACCOUNT_ID
                    ? { ...account, archivedAt: '2026-10-01T00:00:00.000Z' }
                    : account,
                ),
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
    const body = within(canvasElement.ownerDocument.body);

    await openRowMenu({ canvasElement, text: 'tim@apple.dev' });
    await userEvent.click(
      await body.findByRole('menuitem', {
        name: 'Delete account and synced data',
      }),
    );

    const dialog = within(
      await body.findByRole('dialog', {
        name: 'Delete account and synced data?',
      }),
    );

    expect(dialog.getByText('tim@apple.dev')).toBeVisible();
    expect(dialog.getByText('Fathom')).toBeVisible();

    await userEvent.click(
      dialog.getByRole('button', { name: 'Delete account and data' }),
    );

    await waitFor(() =>
      expect(deleteConnectedAccount).toHaveBeenCalledTimes(2),
    );
    expect(deleteConnectedAccount).toHaveBeenCalledWith(GOOGLE_ACCOUNT_ID);
    expect(deleteConnectedAccount).toHaveBeenCalledWith(FATHOM_ACCOUNT_ID);
    await waitFor(() =>
      expect(canvas.queryByText('tim@apple.dev')).not.toBeInTheDocument(),
    );
    expect(canvas.queryByText('Tim@Apple.dev')).not.toBeInTheDocument();
  },
};

export const CancelRunsNothing: Story = {
  ...accountsTabStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await openRowMenu({ canvasElement, text: 'tim@apple.dev' });
    await userEvent.click(
      await body.findByRole('menuitem', {
        name: 'Delete account and synced data',
      }),
    );
    await userEvent.click(
      within(
        await body.findByRole('dialog', {
          name: 'Delete account and synced data?',
        }),
      ).getByRole('button', { name: 'Cancel' }),
    );
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Delete account and synced data?' }),
      ).not.toBeInTheDocument(),
    );

    expect(disconnectConnectedAccount).not.toHaveBeenCalled();
    expect(deleteConnectedAccount).not.toHaveBeenCalled();
    expect(canvas.queryByText(/Navigated to/)).not.toBeInTheDocument();
  },
};

export const AccountsTabMenuOpensAccountSettingsWithoutReconnect: Story = {
  ...accountsTabStory,
  parameters: {
    msw: {
      handlers: [
        graphql.query('MyConnectedAccounts', () =>
          HttpResponse.json({
            data: {
              myConnectedAccounts: withoutDeletedAccounts(
                CONNECTED_ACCOUNTS.map((account) =>
                  account.id === GOOGLE_ACCOUNT_ID
                    ? { ...account, authFailedAt: '2026-10-01T00:00:00.000Z' }
                    : account,
                ),
              ),
            },
          }),
        ),
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openRowMenu({ canvasElement, text: 'tim@apple.dev' });

    expect(
      await body.findByRole('menuitem', { name: 'Account settings' }),
    ).toHaveAttribute('href', `/settings/accounts/detail/${GOOGLE_ACCOUNT_ID}`);
    expect(
      body.queryByRole('menuitem', { name: 'Reconnect' }),
    ).not.toBeInTheDocument();
  },
};

export const AppOnlyAccountOffersDisconnectAndDelete: Story = {
  ...accountsTabStory,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openRowMenu({ canvasElement, text: 'notes@apple.dev' });

    expect(
      await body.findByRole('menuitem', { name: 'Disconnect account' }),
    ).toBeVisible();
    expect(
      body.getByRole('menuitem', { name: 'Delete account and synced data' }),
    ).toBeVisible();
    expect(
      body.queryByRole('menuitem', { name: 'Account settings' }),
    ).not.toBeInTheDocument();
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
      await getTableRow(canvasElement, 'Outlook').findByText('Missing account'),
    ).toBeVisible();
    expect(
      getTableRow(canvasElement, 'Gmail and Calendar').queryByText(
        'Missing account',
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
      getTableRow(canvasElement, 'Fathom').getByText('Missing configuration'),
    ).toBeVisible();
    expect(
      getTableRow(canvasElement, 'Granola').queryByText(
        'Missing configuration',
      ),
    ).not.toBeInTheDocument();
    expect(
      getTableRow(canvasElement, 'Linear').queryByText('Missing configuration'),
    ).not.toBeInTheDocument();
    expect(
      await getTableRow(canvasElement, 'Linear').findByText('Missing account'),
    ).toBeVisible();
  },
};

export const AppsWhoseProviderIsNotSetUpShowNoMissingAccount: Story = {
  ...accountsTabStory,
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    unconfigureLinearClientCredentials();
  },
  parameters: {
    msw: { handlers: APPLICATION_PREFERENCES_GRAPHQL_HANDLERS },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim@apple.dev', undefined, { timeout: 3000 });
    await userEvent.click(getTab({ canvasElement, tabId: 'apps' }));
    await canvas.findByText('Linear', undefined, { timeout: 3000 });

    expect(
      getTableRow(canvasElement, 'Linear').queryByText('Missing account'),
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

export const BlocklistFallsBackToAccountsTabWithoutBuiltInAccountApp: Story = {
  ...accountsTabStory,
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
      await canvas.findByText('Blocklist', undefined, { timeout: 3000 }),
    ).toBeVisible();

    await userEvent.click(getTab({ canvasElement, tabId: 'apps' }));

    expect(await canvas.findByText('Fathom')).toBeVisible();
    expect(
      canvas.queryByRole('link', { name: 'Gmail and Calendar' }),
    ).not.toBeInTheDocument();
    expect(canvas.queryByText('Blocklist')).not.toBeInTheDocument();
  },
};
