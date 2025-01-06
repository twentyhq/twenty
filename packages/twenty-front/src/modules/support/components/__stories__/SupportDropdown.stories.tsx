import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedUserData,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

import { SupportDropdown } from '@/support/components/SupportDropdown';
import { PrefetchLoadedDecorator } from '~/testing/decorators/PrefetchLoadedDecorator';

const meta: Meta<typeof SupportDropdown> = {
  title: 'Modules/Support/SupportDropdown',
  component: SupportDropdown,
  decorators: [
    (Story) => {
      const setCurrentUser = useSetRecoilState(currentUserState);
      const setSupportChat = useSetRecoilState(supportChatState);
      const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
      const setCurrentWorkspaceMember = useSetRecoilState(
        currentWorkspaceMemberState,
      );

      setCurrentWorkspace(mockCurrentWorkspace);
      setCurrentWorkspaceMember(mockedWorkspaceMemberData);
      setCurrentUser(mockedUserData);
      setSupportChat({ supportDriver: 'front', supportFrontChatId: '1234' });

      return <Story />;
    },
    PrefetchLoadedDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof SupportDropdown>;

export const Default: Story = {
  play: async () => {
    const canvas = within(document.body);

    expect(await canvas.findByText('Support')).toBeInTheDocument();
    await userEvent.click(canvas.getByText('Support'));

    expect(await canvas.findByText('Documentation')).toBeInTheDocument();
    expect(await canvas.findByText('Talk to us')).toBeInTheDocument();
  },
};
