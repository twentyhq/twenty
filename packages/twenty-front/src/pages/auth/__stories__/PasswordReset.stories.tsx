import { getOperationName } from '@apollo/client/utilities';
import { type Meta, type StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { HttpResponse, graphql } from 'msw';

import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import {
  OnboardingStatus,
  ValidatePasswordResetTokenDocument,
} from '~/generated-metadata/graphql';
import { PasswordReset } from '~/pages/auth/PasswordReset';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedOnboardingUserData } from '~/testing/mock-data/users';

const mockedOnboardingUsersData = mockedOnboardingUserData(
  OnboardingStatus.COMPLETED,
);

const buildHandlers = (hasPassword: boolean) => [
  graphql.query(
    getOperationName(ValidatePasswordResetTokenDocument) ?? '',
    () =>
      HttpResponse.json({
        data: {
          validatePasswordResetToken: {
            __typename: 'ValidatePasswordResetTokenOutput',
            id: mockedOnboardingUsersData.id,
            email: mockedOnboardingUsersData.email,
            hasPassword,
          },
        },
      }),
  ),
  graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () =>
    HttpResponse.json({
      data: {
        currentUser: {
          ...mockedOnboardingUsersData,
          hasPassword,
        },
      },
    }),
  ),
  ...graphqlMocks.handlers,
];

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Auth/PasswordReset',
  component: PasswordReset,
  decorators: [PageDecorator, I18nFrontDecorator],
};

export default meta;

export type Story = StoryObj<typeof PasswordReset>;

export const ChangePassword: Story = {
  args: {
    routePath: '/reset-password/:passwordResetToken',
    routeParams: {
      ':passwordResetToken': 'MOCKED_TOKEN_CHANGE',
    },
  },
  parameters: {
    msw: {
      handlers: buildHandlers(true),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole(
      'button',
      { name: 'Change Password' },
      { timeout: 3000 },
    );
  },
};

export const SetPassword: Story = {
  args: {
    routePath: '/reset-password/:passwordResetToken',
    routeParams: {
      ':passwordResetToken': 'MOCKED_TOKEN_SET',
    },
  },
  parameters: {
    msw: {
      handlers: buildHandlers(false),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole(
      'button',
      { name: 'Set Password' },
      { timeout: 3000 },
    );
  },
};
