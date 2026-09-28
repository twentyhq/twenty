import { getOperationName } from '~/utils/getOperationName';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, within } from 'storybook/test';
import { AppPath } from 'twenty-shared/types';

import { OnboardingStatus } from '~/generated-metadata/graphql';
import { GET_CURRENT_USER } from '~/modules/users/graphql/queries/getCurrentUser';
import { SyncEmails } from '~/pages/onboarding/SyncEmails';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedOnboardingUserData } from '~/testing/mock-data/users';

const buildMswHandlers = ({
  isWorkspaceCreator,
}: {
  isWorkspaceCreator: boolean;
}) => [
  graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
    return HttpResponse.json({
      data: {
        currentUser: {
          ...mockedOnboardingUserData(OnboardingStatus.SYNC_EMAIL),
          isWorkspaceCreator,
        },
      },
    });
  }),
  graphqlMocks.handlers,
];

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/SyncEmails',
  component: SyncEmails,
  decorators: [PageDecorator],
  args: { routePath: AppPath.SyncEmails },
  parameters: {
    msw: {
      handlers: buildMswHandlers({ isWorkspaceCreator: true }),
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SyncEmails>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Import your contacts');
    await canvas.findByText('Earn +2');
  },
};

export const InvitedUser: Story = {
  parameters: {
    msw: {
      handlers: buildMswHandlers({ isWorkspaceCreator: false }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Import your contacts');
    expect(canvas.queryByText('Earn +2')).not.toBeInTheDocument();
  },
};
