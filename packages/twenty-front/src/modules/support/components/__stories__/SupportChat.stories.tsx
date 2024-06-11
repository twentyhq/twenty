import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockDefaultWorkspace,
  mockedUsersData,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

import { SupportChat } from '../SupportChat';

const meta: Meta<typeof SupportChat> = {
  title: 'Modules/Support/SupportChat',
  component: SupportChat,
  decorators: [
    (Story) => {
      const setCurrentUser = useSetRecoilState(currentUserState);
      const setSupportChat = useSetRecoilState(supportChatState);
      const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
      const setCurrentWorkspaceMember = useSetRecoilState(
        currentWorkspaceMemberState,
      );

      setCurrentWorkspace(mockDefaultWorkspace);
      setCurrentWorkspaceMember(mockedWorkspaceMemberData);
      setCurrentUser(mockedUsersData[0]);
      setSupportChat({ supportDriver: 'front', supportFrontChatId: '1234' });

      return <Story />;
    },
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof SupportChat>;

export const Default: Story = {
  play: async () => {
    const canvas = within(document.body);
    expect(await canvas.findByText('Support')).toBeInTheDocument();
  },
};
