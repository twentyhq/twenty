import { getOperationName } from '~/utils/getOperationName';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, within } from 'storybook/test';
import { AppPath } from 'twenty-shared/types';

import { FIND_MANY_MARKETPLACE_APPS } from '@/marketplace/graphql/queries/findManyMarketplaceApps';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import { GET_CURRENT_USER } from '~/modules/users/graphql/queries/getCurrentUser';
import { InstallApps } from '~/pages/onboarding/InstallApps';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import { mockedOnboardingUserData } from '~/testing/mock-data/users';

const CALL_RECORDER_UNIVERSAL_IDENTIFIER =
  '8da4b8b5-5edf-4880-b51f-ab6e679ec617';
const ENRICHMENT_UNIVERSAL_IDENTIFIER = '4a1178c1-3535-4a47-b592-231d3216b36f';
const LAST_CONTACT_UNIVERSAL_IDENTIFIER =
  '66a504cc-0a75-410e-a43f-cdeae1db1522';

const buildMarketplaceApp = (id: string, name: string) => ({
  __typename: 'MarketplaceApp',
  id,
  name,
  description: name,
  author: 'Twenty',
  category: 'productivity',
  logo: null,
  sourcePackage: name,
  isVetted: true,
});

const currentUserHandler = graphql.query(
  getOperationName(GET_CURRENT_USER) ?? '',
  () => {
    return HttpResponse.json({
      data: {
        currentUser: mockedOnboardingUserData(
          OnboardingStatus.APPS_INSTALLATION,
        ),
      },
    });
  },
);

const buildHandlers = (
  marketplaceApps: ReturnType<typeof buildMarketplaceApp>[],
) => [
  currentUserHandler,
  graphql.query(getOperationName(FIND_MANY_MARKETPLACE_APPS) ?? '', () => {
    return HttpResponse.json({
      data: { findManyMarketplaceApps: marketplaceApps },
    });
  }),
  graphqlMocks.handlers,
];

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/InstallApps',
  component: InstallApps,
  decorators: [PageDecorator],
  args: { routePath: AppPath.InstallApps },
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
  },
  parameters: {
    msw: {
      handlers: buildHandlers([
        buildMarketplaceApp(
          CALL_RECORDER_UNIVERSAL_IDENTIFIER,
          'Call recorder',
        ),
        buildMarketplaceApp(ENRICHMENT_UNIVERSAL_IDENTIFIER, 'Enrichment'),
        buildMarketplaceApp(LAST_CONTACT_UNIVERSAL_IDENTIFIER, 'Last contact'),
      ]),
    },
  },
};

export default meta;

export type Story = StoryObj<typeof InstallApps>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Install your first apps');
    await canvas.findByText('Call recorder');
    await canvas.findByText('Enrichment');
    await canvas.findByText('Last contact');
  },
};

export const OnlyAvailableApps: Story = {
  parameters: {
    msw: {
      handlers: buildHandlers([
        buildMarketplaceApp(
          CALL_RECORDER_UNIVERSAL_IDENTIFIER,
          'Call recorder',
        ),
      ]),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Call recorder');
    expect(canvas.queryByText('Enrichment')).toBeNull();
    expect(canvas.queryByText('Last contact')).toBeNull();
  },
};

export const MarketplaceUnavailable: Story = {
  parameters: {
    msw: {
      handlers: [
        currentUserHandler,
        graphql.query(
          getOperationName(FIND_MANY_MARKETPLACE_APPS) ?? '',
          () => {
            return HttpResponse.json({
              errors: [{ message: 'Marketplace unavailable' }],
            });
          },
        ),
        graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('No apps are available to install right now');
    expect(canvas.queryByText('Install')).toBeNull();
    await canvas.findByText('Skip');
  },
};
