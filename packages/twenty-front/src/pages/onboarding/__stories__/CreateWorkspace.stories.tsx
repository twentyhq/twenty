import { getOperationName } from '~/utils/getOperationName';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { within } from 'storybook/test';

import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { AppPath } from 'twenty-shared/types';
import { OnboardingStatus } from '~/generated-metadata/graphql';
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

// The name (and optional logo) are collected in the shared creation form, so
// this onboarding step is now a pure activation loader.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Creating your workspace', undefined, {
      timeout: 3000,
    });
  },
};
