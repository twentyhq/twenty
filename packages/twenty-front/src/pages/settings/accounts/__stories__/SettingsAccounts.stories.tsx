import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql, http } from 'msw';
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
  GOOGLE_ACCOUNT_ID,
  MICROSOFT_ACCOUNT_ID,
  deleteConnectedAccount,
  seedAccountGroupsStory,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';
import {
  APPLICATION_PREFERENCES_GRAPHQL_HANDLERS,
  seedApplicationPreferencesStory,
} from '~/pages/settings/accounts/__stories__/mockedApplicationPreferences';

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

    await canvas.findByText('Used by', undefined, { timeout: 3000 });

    expect(canvas.getAllByText('App preferences').length).toBeGreaterThan(0);
    expect(canvas.queryByText('Connected accounts')).not.toBeInTheDocument();

    const timRow = getTableRow(canvasElement, 'tim@apple.dev');

    expect(timRow.getByRole('img', { name: 'Gmail' })).toBeVisible();
    expect(timRow.getByRole('img', { name: 'Google Calendar' })).toBeVisible();
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
      notesRow.queryByRole('img', { name: 'Gmail' }),
    ).not.toBeInTheDocument();
    expect(
      notesRow.queryByRole('button', { name: 'More options' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('link', { name: 'notes@apple.dev' }),
    ).not.toBeInTheDocument();

    expect(canvas.getByText('sales@apple.dev')).toBeVisible();
    expect(canvas.queryByText('support@apple.dev')).not.toBeInTheDocument();
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

    expect(canvas.getByRole('link', { name: 'Gmail' })).toBeVisible();
    expect(canvas.getByRole('link', { name: 'Google Calendar' })).toBeVisible();
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

    await canvas.findByText('Used by', undefined, { timeout: 3000 });
    await userEvent.click(
      getTableRow(canvasElement, 'tim@apple.dev').getByRole('img', {
        name: 'Gmail',
      }),
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

    await canvas.findByText('Used by', undefined, { timeout: 3000 });

    const openDeleteDialog = async () => {
      await userEvent.click(
        getTableRow(canvasElement, 'tim@apple.dev').getByRole('button', {
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
      getTableRow(canvasElement, 'Tim@Apple.dev'),
    );

    expect(remainingRow.getByRole('img', { name: 'Fathom' })).toBeVisible();
    expect(
      remainingRow.queryByRole('button', { name: 'More options' }),
    ).not.toBeInTheDocument();
    expect(canvas.queryByText('tim@apple.dev')).not.toBeInTheDocument();
    expect(deleteConnectedAccount.mock.calls).toEqual([[GOOGLE_ACCOUNT_ID]]);
    expect(canvas.queryByText(/Navigated to/)).not.toBeInTheDocument();
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
      getTableRow(canvasElement, 'Google Calendar').getByText(
        'Missing account',
      ),
    ).toBeVisible();
    expect(
      getTableRow(canvasElement, 'Gmail').queryByText('Missing account'),
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

export const InstalledAppsKeepBlocklistWhenNoNativeAppIsEnabled: Story = {
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
      canvas.queryByRole('link', { name: 'Gmail' }),
    ).not.toBeInTheDocument();
  },
};
