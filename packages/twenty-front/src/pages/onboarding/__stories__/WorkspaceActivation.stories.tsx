import { getOperationName } from '~/utils/getOperationName';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { within } from 'storybook/test';

import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { AppPath } from 'twenty-shared/types';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import { WorkspaceActivation } from '~/pages/onboarding/WorkspaceActivation';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedOnboardingUserData } from '~/testing/mock-data/users';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/WorkspaceActivation',
  component: WorkspaceActivation,
  decorators: [PageDecorator],
  args: { routePath: AppPath.WorkspaceActivation },
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

export type Story = StoryObj<typeof WorkspaceActivation>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Creating your workspace...', undefined, {
      timeout: 3000,
    });
  },
};
