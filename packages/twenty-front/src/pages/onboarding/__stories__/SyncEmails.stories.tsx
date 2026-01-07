import { getOperationName } from '@apollo/client/utilities';
import { type Meta, type StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { HttpResponse, graphql } from 'msw';
import { AppPath } from 'twenty-shared/types';

import { OnboardingStatus } from '~/generated/graphql';
import { GET_CURRENT_USER } from '~/modules/users/graphql/queries/getCurrentUser';
import { SyncEmails } from '~/pages/onboarding/SyncEmails';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedOnboardingUserData } from '~/testing/mock-data/users';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/SyncEmails',
  component: SyncEmails,
  decorators: [I18nFrontDecorator, PageDecorator],
  args: { routePath: AppPath.SyncEmails },
  parameters: {
    msw: {
      handlers: [
        graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
          return HttpResponse.json({
            data: {
              currentUser: mockedOnboardingUserData(
                OnboardingStatus.SYNC_EMAIL,
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

export type Story = StoryObj<typeof SyncEmails>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Emails and Calendar');
  },
};
