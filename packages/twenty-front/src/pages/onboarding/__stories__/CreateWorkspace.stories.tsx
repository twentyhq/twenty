import { getOperationName } from '@apollo/client/utilities';
import { type Meta, type StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { HttpResponse, graphql } from 'msw';

import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { AppPath } from 'twenty-shared/types';
import { OnboardingStatus } from '~/generated/graphql';
import { CreateWorkspace } from '~/pages/onboarding/CreateWorkspace';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedOnboardingUserData } from '~/testing/mock-data/users';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/CreateWorkspace',
  component: CreateWorkspace,
  decorators: [PageDecorator],
  args: { routePath: AppPath.CreateWorkspace },
  parameters: {
    msw: {
      handlers: [
        graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
          return HttpResponse.json({
            data: {
              currentUser: mockedOnboardingUserData(
                OnboardingStatus.WORKSPACE_ACTIVATION,
              ),
            },
          });
        }),
        graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof CreateWorkspace>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Create your workspace', undefined, {
      timeout: 3000,
    });
  },
};
