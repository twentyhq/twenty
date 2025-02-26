import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { RolesDefaultRole } from '@/settings/roles/components/RolesDefaultRole';
import { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';
import { ComponentDecorator } from 'twenty-ui';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { getRolesMock } from '~/testing/mock-data/roles';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const rolesMock = getRolesMock();

const RolesDefaultRoleWrapper = () => {
  return (
    <RecoilRoot
      initializeState={(snapshot) => {
        snapshot.set(currentWorkspaceState, {
          ...mockCurrentWorkspace,
          defaultRole: rolesMock[1],
        });
      }}
    >
      <RolesDefaultRole roles={rolesMock} />
    </RecoilRoot>
  );
};

const meta: Meta<typeof RolesDefaultRoleWrapper> = {
  title: 'Modules/Settings/Roles/RolesDefaultRole',
  component: RolesDefaultRoleWrapper,
  decorators: [ComponentDecorator, I18nFrontDecorator],
  parameters: {
    maxWidth: 800,
  },
};

export default meta;
type Story = StoryObj<typeof RolesDefaultRoleWrapper>;

export const Default: Story = {
  args: {
    roles: rolesMock,
  },
};
