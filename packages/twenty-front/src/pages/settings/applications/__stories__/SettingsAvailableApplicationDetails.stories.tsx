import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  ApplicationRegistrationSourceType,
  PermissionFlagType,
  type FindMarketplaceAppDetailQuery,
} from '~/generated-metadata/graphql';
import { SettingsAvailableApplicationDetails } from '~/pages/settings/applications/SettingsAvailableApplicationDetails';

const APPLICATION_UNIVERSAL_IDENTIFIER = '20202020-7c1d-4e2f-8a3b-000000000001';

const LINKEDIN_MARKETPLACE_APP_DETAIL: FindMarketplaceAppDetailQuery['findMarketplaceAppDetail'] =
  {
    __typename: 'MarketplaceAppDetail',
    id: 'linkedin-marketplace-id',
    universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    name: 'LinkedIn',
    sourceType: ApplicationRegistrationSourceType.NPM,
    sourcePackage: '@twenty/linkedin',
    latestAvailableVersion: '0.5.0',
    isListed: true,
    description:
      'Your LinkedIn conversations, on the people and companies they are about.',
    author: 'Twenty',
    category: 'Communication',
    logoUrl: null,
    websiteUrl: null,
    connectUrl: null,
    aboutDescription: null,
    pricingDescription: '$7 per month per connected LinkedIn account',
    termsUrl: null,
    emailSupport: null,
    issueReportUrl: null,
    galleryImages: [],
    installCount: 12,
    defaultRoleUniversalIdentifier: null,
    requestedCapabilities: [],
    requestedIframeMediaPermissions: [],
    billsCredits: true,
    objects: [],
    roles: [],
  };

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Applications/SettingsAvailableApplicationDetails',
  component: SettingsAvailableApplicationDetails,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/applications/available/:availableApplicationId',
    routeParams: {
      ':availableApplicationId': APPLICATION_UNIVERSAL_IDENTIFIER,
    },
  },
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
  },
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        graphql.query('FindMarketplaceAppDetail', () =>
          HttpResponse.json({
            data: { findMarketplaceAppDetail: LINKEDIN_MARKETPLACE_APP_DETAIL },
          }),
        ),
        graphql.query('FindMarketplaceAppContent', () =>
          HttpResponse.json({
            data: {
              findMarketplaceAppDetail: {
                ...LINKEDIN_MARKETPLACE_APP_DETAIL,
                content: null,
              },
            },
          }),
        ),
        graphql.query('FindInstallApplicationJobStatus', () =>
          HttpResponse.json({
            data: { findInstallApplicationJobStatus: null },
          }),
        ),
        graphql.query('FindOneApplicationByUniversalIdentifier', () =>
          HttpResponse.json({
            errors: [
              { message: 'Not installed', extensions: { code: 'NOT_FOUND' } },
            ],
          }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAvailableApplicationDetails>;

export const SubscriptionAppShowsAsPaid: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Paid app', undefined, { timeout: 3000 }),
    ).toBeVisible();
  },
};

export const SubscriptionAppAsksForBillingConsentOnInstall: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Paid app', undefined, { timeout: 3000 });
    jotaiStore.set(currentUserWorkspaceState.atom, {
      permissionFlags: [PermissionFlagType.APPLICATIONS],
      objectRecordsPermissions: [],
      twoFactorAuthenticationMethodSummary: [],
      isImpersonating: false,
    });

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Install' }, { timeout: 3000 }),
    );

    const body = within(canvasElement.ownerDocument.body);

    await waitFor(() =>
      expect(body.getByText('Bill your workspace')).toBeVisible(),
    );
  },
};
