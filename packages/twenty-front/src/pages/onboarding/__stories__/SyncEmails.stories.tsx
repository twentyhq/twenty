import { getOperationName } from '~/utils/getOperationName';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, within } from 'storybook/test';
import { AppPath } from 'twenty-shared/types';

import { currentUserState } from '@/auth/states/currentUserState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import { GET_CURRENT_USER } from '~/modules/users/graphql/queries/getCurrentUser';
import { SyncEmails } from '~/pages/onboarding/SyncEmails';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockedOnboardingUserData,
  mockedUserData,
} from '~/testing/mock-data/users';

const setIsWorkspaceCreator = (isWorkspaceCreator: boolean) => {
  jotaiStore.set(currentUserState.atom, {
    ...mockedUserData,
    isWorkspaceCreator,
  });
};

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/SyncEmails',
  component: SyncEmails,
  decorators: [PageDecorator],
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
  beforeEach: () => {
    setIsWorkspaceCreator(true);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Import your contacts');
    await canvas.findByText('Earn +2');
  },
};

export const InvitedUser: Story = {
  beforeEach: () => {
    setIsWorkspaceCreator(false);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Import your contacts');
    expect(canvas.queryByText('Earn +2')).not.toBeInTheDocument();
  },
};
