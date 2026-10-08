import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsAccounts } from '~/pages/settings/accounts/SettingsAccounts';
import {
  ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
  GOOGLE_ACCOUNT_ID,
  deleteConnectedAccount,
  seedAccountGroupsStory,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';

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

const getAccountRow = (canvasElement: HTMLElement, handle: string) => {
  const row = within(canvasElement)
    .getByText(handle)
    .closest<HTMLElement>('[data-table-row]');

  if (!isDefined(row)) {
    throw new Error(`No account row for ${handle}`);
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
  },
};

export const AccountsGroupedByEmail: Story = {
  ...accountGroupsStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Used by', undefined, { timeout: 3000 });

    const timRow = getAccountRow(canvasElement, 'tim@apple.dev');

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

    const outlookRow = getAccountRow(canvasElement, 'tim@outlook.com');

    expect(outlookRow.getAllByRole('img', { name: 'Outlook' })).toHaveLength(1);

    const notesRow = getAccountRow(canvasElement, 'notes@apple.dev');

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

export const RowOpensAccountPage: Story = {
  ...accountGroupsStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Used by', undefined, { timeout: 3000 });
    await userEvent.click(
      getAccountRow(canvasElement, 'tim@apple.dev').getByRole('img', {
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
        getAccountRow(canvasElement, 'tim@apple.dev').getByRole('button', {
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
      getAccountRow(canvasElement, 'Tim@Apple.dev'),
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
