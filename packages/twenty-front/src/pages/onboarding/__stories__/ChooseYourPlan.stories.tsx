import { getOperationName } from '~/utils/getOperationName';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { within } from 'storybook/test';

import { LIST_PLANS } from '@/settings/billing/graphql/queries/listPlans';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { AppPath } from 'twenty-shared/types';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import { ChooseYourPlan } from '~/pages/onboarding/ChooseYourPlan';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import { mockedOnboardingUserData } from '~/testing/mock-data/users';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/ChooseYourPlan',
  component: ChooseYourPlan,
  decorators: [PageDecorator],
  args: { routePath: AppPath.PlanRequired },
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
          return HttpResponse.json({
            data: {
              currentUser: mockedOnboardingUserData(OnboardingStatus.COMPLETED),
            },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof ChooseYourPlan>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await canvas.findByText('Upgrade your free trial', undefined, {
      timeout: 3000,
    });
  },
};

export const PlansQueryError: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query(getOperationName(LIST_PLANS) ?? '', () => {
          return HttpResponse.json({
            errors: [{ message: 'Internal server error' }],
          });
        }),
        ...(meta.parameters?.msw.handlers ?? []),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await canvas.findByText("We couldn't load the plans", undefined, {
      timeout: 3000,
    });
    await canvas.findByText('Try again');
  },
};
