import { getOperationName } from '~/utils/getOperationName';
import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { useEffect } from 'react';
import { expect, within } from 'storybook/test';
import { AppPath } from 'twenty-shared/types';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import { GET_CURRENT_USER } from '~/modules/users/graphql/queries/getCurrentUser';
import { SyncEmails } from '~/pages/onboarding/SyncEmails';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedOnboardingUserData,
} from '~/testing/mock-data/users';

const InvitedWorkspaceDecorator: Decorator = (Story) => {
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);

  useEffect(() => {
    setCurrentWorkspace({ ...mockCurrentWorkspace, workspaceMembersCount: 2 });
  }, [setCurrentWorkspace]);

  return <Story />;
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
  decorators: [WorkspaceDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Import your contacts');
    await canvas.findByText('Earn +2');
  },
};

export const InvitedUser: Story = {
  decorators: [InvitedWorkspaceDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Import your contacts');
    expect(canvas.queryByText('Earn +2')).not.toBeInTheDocument();
  },
};
