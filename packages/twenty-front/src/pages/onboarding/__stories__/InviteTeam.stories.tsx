import { getOperationName } from '@apollo/client/utilities';
import { type Meta, type StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { HttpResponse, graphql } from 'msw';
import { AppPath } from 'twenty-shared/types';

import { OnboardingStatus } from '~/generated/graphql';
import { GET_CURRENT_USER } from '~/modules/users/graphql/queries/getCurrentUser';
import { InviteTeam } from '~/pages/onboarding/InviteTeam';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedOnboardingUserData } from '~/testing/mock-data/users';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/InviteTeam',
  component: InviteTeam,
  decorators: [PageDecorator],
  args: { routePath: AppPath.InviteTeam },
  parameters: {
    msw: {
      handlers: [
        graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
          return HttpResponse.json({
            data: {
              currentUser: mockedOnboardingUserData(
                OnboardingStatus.INVITE_TEAM,
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

export type Story = StoryObj<typeof InviteTeam>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Invite your team');
  },
};
