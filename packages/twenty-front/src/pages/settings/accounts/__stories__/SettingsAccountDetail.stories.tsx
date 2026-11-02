import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, delay, graphql } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { SettingsAccountDetail } from '~/pages/settings/accounts/SettingsAccountDetail';
import {
  ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
  FATHOM_APPLICATION_ID,
  FATHOM_ONLY_ACCOUNT_ID,
  GOOGLE_ACCOUNT_ID,
  GRANOLA_APPLICATION_ID,
  seedAccountGroupsStory,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';
import { GENERATE_TRANSIENT_TOKEN_GRAPHQL_HANDLER } from '~/pages/settings/accounts/__stories__/mockedLinearApplicationPreferences';

const FATHOM_USER_SETTINGS_MENU_ITEM_ID =
  '20202020-1a2b-4c3d-8e4f-000000000051';
const FATHOM_USER_SETTINGS_FRONT_COMPONENT_ID =
  '20202020-1a2b-4c3d-8e4f-000000000052';
const GRANOLA_USER_SETTINGS_MENU_ITEM_ID =
  '20202020-1a2b-4c3d-8e4f-000000000053';
const GRANOLA_USER_SETTINGS_FRONT_COMPONENT_ID =
  '20202020-1a2b-4c3d-8e4f-000000000054';

const findOneFrontComponent = fn();

const buildUserApplicationPreferences = ({
  applicationId,
  settingsMenuItemId,
  frontComponentId,
}: {
  applicationId: string;
  settingsMenuItemId: string;
  frontComponentId: string;
}) => ({
  __typename: 'ApplicationPreferences',
  applicationId,
  connectionProviders: [],
  variables: [],
  settingsMenuItems: [
    {
      __typename: 'SettingsMenuItem',
      id: settingsMenuItemId,
      universalIdentifier: settingsMenuItemId,
      applicationId,
      frontComponentId,
      title: 'My settings',
      icon: 'IconUser',
      position: 1,
      scope: 'USER',
      slug: null,
    },
  ],
});

const APPLICATION_SETTINGS_GRAPHQL_HANDLERS = [
  graphql.query('MyApplicationPreferences', () =>
    HttpResponse.json({
      data: {
        myApplicationPreferences: [
          buildUserApplicationPreferences({
            applicationId: FATHOM_APPLICATION_ID,
            settingsMenuItemId: FATHOM_USER_SETTINGS_MENU_ITEM_ID,
            frontComponentId: FATHOM_USER_SETTINGS_FRONT_COMPONENT_ID,
          }),
          buildUserApplicationPreferences({
            applicationId: GRANOLA_APPLICATION_ID,
            settingsMenuItemId: GRANOLA_USER_SETTINGS_MENU_ITEM_ID,
            frontComponentId: GRANOLA_USER_SETTINGS_FRONT_COMPONENT_ID,
          }),
        ],
      },
    }),
  ),
  graphql.query('FindOneFrontComponent', ({ variables }) => {
    findOneFrontComponent(variables.id);

    return HttpResponse.json({ data: { frontComponent: null } });
  }),
  GENERATE_TRANSIENT_TOKEN_GRAPHQL_HANDLER,
];

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsAccountDetail',
  component: SettingsAccountDetail,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/app-preferences/accounts/:connectedAccountId',
    routeParams: { ':connectedAccountId': GOOGLE_ACCOUNT_ID },
    additionalRoutes: ['/settings/app-preferences'],
  },
  beforeEach: seedAccountGroupsStory,
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: ACCOUNT_GROUPS_GRAPHQL_HANDLERS },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAccountDetail>;

export const EmailsAndCalendarTabs: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByTestId('tab-emails', undefined, { timeout: 3000 }),
    );

    expect(canvas.getByText('Apps preferences')).toBeVisible();
    expect(await canvas.findByText('Visibility')).toBeVisible();

    await userEvent.click(canvas.getByTestId('tab-calendar'));

    expect(await canvas.findByText('Event visibility')).toBeVisible();
  },
};

export const ConnectedAppSettingsOpenFromTheirTab: Story = {
  beforeEach: () => {
    findOneFrontComponent.mockClear();
  },
  parameters: {
    msw: {
      handlers: [
        ...APPLICATION_SETTINGS_GRAPHQL_HANDLERS,
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const fathomTab = await canvas.findByTestId(
      `tab-${FATHOM_USER_SETTINGS_MENU_ITEM_ID}`,
      undefined,
      { timeout: 3000 },
    );

    expect(fathomTab).toHaveTextContent('Fathom');
    expect(canvas.getByTestId('tab-emails')).toBeVisible();
    expect(
      canvas.queryByTestId(`tab-${GRANOLA_USER_SETTINGS_MENU_ITEM_ID}`),
    ).not.toBeInTheDocument();

    await userEvent.click(fathomTab);

    await waitFor(
      () =>
        expect(findOneFrontComponent).toHaveBeenCalledWith(
          FATHOM_USER_SETTINGS_FRONT_COMPONENT_ID,
        ),
      { timeout: 3000 },
    );
  },
};

export const TitleStaysWhileLoading: Story = {
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

    await waitFor(() =>
      expect(canvasElement.querySelector('[aria-busy="true"]')).not.toBeNull(),
    );
    expect(canvas.queryByText('tim@apple.dev')).not.toBeInTheDocument();
    expect(
      canvas.queryByText('Navigated to /settings/app-preferences'),
    ).not.toBeInTheDocument();
  },
};

export const AccountWithoutSettingsGoesBackToAppPreferences: Story = {
  args: {
    routeParams: { ':connectedAccountId': FATHOM_ONLY_ACCOUNT_ID },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Navigated to /settings/app-preferences',
        undefined,
        {
          timeout: 3000,
        },
      ),
    ).toBeVisible();
  },
};
