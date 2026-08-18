import { getOperationName } from '~/utils/getOperationName';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { within } from 'storybook/test';
import { AppPath } from 'twenty-shared/types';

import { IS_CONNECT_SLACK_ONBOARDING_STEP_AVAILABLE } from '@/onboarding/graphql/queries/isConnectSlackOnboardingStepAvailable';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import { GET_CURRENT_USER } from '~/modules/users/graphql/queries/getCurrentUser';
import { ConnectSlack } from '~/pages/onboarding/ConnectSlack';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import { mockedOnboardingUserData } from '~/testing/mock-data/users';

const buildHandlers = (isConnectSlackOnboardingStepAvailable: boolean) => [
  graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
    return HttpResponse.json({
      data: {
        currentUser: mockedOnboardingUserData(OnboardingStatus.CONNECT_SLACK),
      },
    });
  }),
  graphql.query(
    getOperationName(IS_CONNECT_SLACK_ONBOARDING_STEP_AVAILABLE) ?? '',
    () => {
      return HttpResponse.json({
        data: { isConnectSlackOnboardingStepAvailable },
      });
    },
  ),
  graphqlMocks.handlers,
];

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/ConnectSlack',
  component: ConnectSlack,
  decorators: [PageDecorator],
  args: { routePath: AppPath.ConnectSlack },
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
  },
  parameters: {
    msw: { handlers: buildHandlers(true) },
  },
};

export default meta;

export type Story = StoryObj<typeof ConnectSlack>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Bring your CRM into Slack');
    await canvas.findByText('Add to Slack');
  },
};
