import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  ApplicationRegistrationSourceType,
  FeatureFlagKey,
  type FindMarketplaceAppDetailQuery,
} from '~/generated-metadata/graphql';
import { CLAUDE_CONNECTABLE_APP } from '@/settings/app-preferences/testing/connectableAppFixtures';
import { SettingsAvailableApplicationDetails } from '~/pages/settings/applications/SettingsAvailableApplicationDetails';

const CLAUDE_UNIVERSAL_IDENTIFIER = CLAUDE_CONNECTABLE_APP.id;

const CLAUDE_MARKETPLACE_APP_DETAIL: FindMarketplaceAppDetailQuery['findMarketplaceAppDetail'] =
  {
    __typename: 'MarketplaceAppDetail',
    id: 'claude-registration-id',
    universalIdentifier: CLAUDE_UNIVERSAL_IDENTIFIER,
    name: 'Claude',
    sourceType: ApplicationRegistrationSourceType.NPM,
    connectUrl: CLAUDE_CONNECTABLE_APP.connectUrl,
    sourcePackage: '@twentyhq/claude',
    latestAvailableVersion: '0.1.0',
    isListed: true,
    description:
      'Work with your Twenty workspace from Claude through the Twenty connector.',
    author: 'Anthropic',
    category: 'Productivity',
    logoUrl: null,
    websiteUrl: 'https://claude.ai',
    aboutDescription:
      'Connect Claude to Twenty to search, create and update your records from a conversation.',
    pricingDescription: null,
    termsUrl: null,
    emailSupport: null,
    issueReportUrl: null,
    galleryImages: [],
    installCount: 3,
    defaultRoleUniversalIdentifier: null,
    requestedCapabilities: [],
    billsCredits: false,
    objects: [],
    roles: [],
  };

const seedAppPreferencesFlag = ({
  isAppPreferencesEnabled,
}: {
  isAppPreferencesEnabled: boolean;
}) => {
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      {
        key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
        value: isAppPreferencesEnabled,
      },
    ],
  });
};

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Applications/SettingsAvailableApplicationDetails',
  component: SettingsAvailableApplicationDetails,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/applications/available/:availableApplicationId',
    routeParams: { ':availableApplicationId': CLAUDE_UNIVERSAL_IDENTIFIER },
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
            data: { findMarketplaceAppDetail: CLAUDE_MARKETPLACE_APP_DETAIL },
          }),
        ),
        graphql.query('FindOneApplicationByUniversalIdentifier', () =>
          HttpResponse.json({
            data: { findOneApplicationByUniversalIdentifier: null },
          }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAvailableApplicationDetails>;

export const AppWithOAuthIdentityOffersToConnectInsteadOfInstall: Story = {
  beforeEach: () => seedAppPreferencesFlag({ isAppPreferencesEnabled: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Work with your Twenty workspace from Claude through the Twenty connector.',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Connect' })).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: /Install/ }),
    ).not.toBeInTheDocument();
  },
};

export const AppWithOAuthIdentityOffersNoActionWhenFeatureFlagIsOff: Story = {
  beforeEach: () => seedAppPreferencesFlag({ isAppPreferencesEnabled: false }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Work with your Twenty workspace from Claude through the Twenty connector.',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Connect' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: /Install/ }),
    ).not.toBeInTheDocument();
  },
};
