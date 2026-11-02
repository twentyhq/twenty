import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, userEvent, within } from 'storybook/test';
import { WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

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
  WellKnownOAuthClient,
} from '~/generated-metadata/graphql';
import { SettingsAvailableApplicationDetails } from '~/pages/settings/applications/SettingsAvailableApplicationDetails';

const CLAUDE_UNIVERSAL_IDENTIFIER =
  WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE;

const CLAUDE_MARKETPLACE_APP_DETAIL: FindMarketplaceAppDetailQuery['findMarketplaceAppDetail'] =
  {
    __typename: 'MarketplaceAppDetail',
    id: 'claude-registration-id',
    universalIdentifier: CLAUDE_UNIVERSAL_IDENTIFIER,
    name: 'Claude',
    sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
    wellKnownOAuthClient: WellKnownOAuthClient.CLAUDE,
    sourcePackage: null,
    latestAvailableVersion: null,
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
            data: { findOneApplication: null },
          }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAvailableApplicationDetails>;

// Storybook serves over http, so Claude's Connect stays disabled with the HTTPS reason
export const WellKnownOAuthClientOffersToConnectInsteadOfInstall: Story = {
  beforeEach: () => seedAppPreferencesFlag({ isAppPreferencesEnabled: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(
      await canvas.findByText(
        'Work with your Twenty workspace from Claude through the Twenty connector.',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
    const connectButton = canvas.getByRole('button', { name: 'Connect' });
    expect(connectButton).toBeDisabled();
    expect(
      canvas.queryByRole('button', { name: /Install/ }),
    ).not.toBeInTheDocument();

    const connectTooltipTrigger = connectButton.parentElement;

    if (!isDefined(connectTooltipTrigger)) {
      throw new Error('Connect tooltip trigger is missing');
    }

    await userEvent.hover(connectTooltipTrigger);
    expect(await body.findByRole('tooltip')).toHaveTextContent(
      'Claude needs this server to use HTTPS.',
    );
  },
};

export const WellKnownOAuthClientOffersNoActionWhenFeatureFlagIsOff: Story = {
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
