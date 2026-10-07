import { type AppPreferencesApplication } from '@/settings/app-preferences/types/AppPreferencesApplication';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, within } from 'storybook/test';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  type MyAppPreferencesApplicationsQuery,
  type MyAppPreferencesApplicationsQueryVariables,
} from '~/generated-metadata/graphql';
import { SettingsAppPreferences } from '~/pages/settings/app-preferences/SettingsAppPreferences';
import {
  getAppPreferencesMocks,
  prepareAppPreferencesStory,
} from '~/pages/settings/app-preferences/__stories__/mockedAppPreferencesData';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

const APPLICATIONS: AppPreferencesApplication[] = [
  {
    id: '20202020-0000-4000-8000-00000000a001',
    universalIdentifier: '20202020-0000-4000-8000-00000000a002',
    name: 'Stripe',
    logoUrl: null,
    hasConnectionProviders: false,
  },
  {
    id: '20202020-0000-4000-8000-00000000a003',
    universalIdentifier: '20202020-0000-4000-8000-00000000a004',
    name: 'LinkedIn scroller',
    logoUrl: null,
    hasConnectionProviders: false,
  },
];

const INSTALLED_APPLICATIONS_HANDLER = graphql.query<
  MyAppPreferencesApplicationsQuery,
  MyAppPreferencesApplicationsQueryVariables
>('MyAppPreferencesApplications', () =>
  HttpResponse.json({
    data: { myAppPreferencesApplications: APPLICATIONS },
  }),
);

const meta: Meta<PageDecoratorArgs> = {
  title:
    'Pages/Settings/AppPreferences/SettingsAppPreferencesInstalledApplications',
  component: SettingsAppPreferences,
  decorators: [PageDecorator],
  args: {
    routePath: getSettingsPath(SettingsPath.AppPreferences),
    routeParams: {},
    additionalRoutes: APPLICATIONS.map(({ id }) =>
      getSettingsPath(SettingsPath.AppPreferencesApplication, {
        applicationId: id,
      }),
    ),
  },
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        INSTALLED_APPLICATIONS_HANDLER,
        ...getAppPreferencesMocks({ accounts: [] }).handlers,
      ],
    },
  },
  beforeEach: () => prepareAppPreferencesStory(),
};

export default meta;
type Story = StoryObj<PageDecoratorArgs>;

export const InstalledApplicationLinks: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const application of APPLICATIONS) {
      await expect(
        await canvas.findByRole('link', { name: application.name }),
      ).toHaveAttribute(
        'href',
        getSettingsPath(SettingsPath.AppPreferencesApplication, {
          applicationId: application.id,
        }),
      );
    }

    await userEvent.click(canvas.getByRole('link', { name: 'Stripe' }));
    await expect(
      await canvas.findByText(
        `Navigated to ${getSettingsPath(
          SettingsPath.AppPreferencesApplication,
          {
            applicationId: APPLICATIONS[0].id,
          },
        )}`,
      ),
    ).toBeVisible();
  },
};

export const MemberWithoutAccountOrApplicationPermissions: Story = {
  beforeEach: () => prepareAppPreferencesStory({ permissionFlags: [] }),
  parameters: {
    msw: {
      handlers: [
        INSTALLED_APPLICATIONS_HANDLER,
        ...getAppPreferencesMocks({
          accounts: [],
          canManageConnectedAccounts: false,
        }).handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('link', { name: 'Stripe' }),
    ).toBeVisible();
    await expect(
      canvas.getByRole('link', { name: 'LinkedIn scroller' }),
    ).toBeVisible();
    await expect(
      canvas.queryByText('Shared accounts between apps'),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', {
        name: /^(Gmail|Outlook|Google Calendar|Email IMAP connector)$/,
      }),
    ).not.toBeInTheDocument();
    await expect(canvas.queryByText('Missing account')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('link', { name: 'Stripe' }));
    await expect(
      await canvas.findByText(
        `Navigated to ${getSettingsPath(
          SettingsPath.AppPreferencesApplication,
          {
            applicationId: APPLICATIONS[0].id,
          },
        )}`,
      ),
    ).toBeVisible();
  },
};
