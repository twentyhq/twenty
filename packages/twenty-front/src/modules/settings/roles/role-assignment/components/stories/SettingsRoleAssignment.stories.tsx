import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { SettingsRoleAssignment } from '@/settings/roles/role-assignment/components/SettingsRoleAssignment';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { UserContext } from '@/users/contexts/UserContext';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';

const SettingsRoleAssignmentWrapper = (
  args: React.ComponentProps<typeof SettingsRoleAssignment>,
) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    args.roleId,
  );

  const role = mockedRoles.find((role) => role.id === args.roleId);

  if (isDefined(role)) {
    setSettingsDraftRole(role);
  }

  return <SettingsRoleAssignment roleId={args.roleId} />;
};

const meta: Meta<typeof SettingsRoleAssignmentWrapper> = {
  title: 'Modules/Settings/Roles/RoleAssignment/SettingsRoleAssignment',
  component: SettingsRoleAssignmentWrapper,
  decorators: [
    (Story) => (
      <UserContext.Provider
        value={{
          dateFormat: DateFormat.DAY_FIRST,
          timeFormat: TimeFormat.HOUR_24,
          timeZone: 'UTC',
        }}
      >
        <Story />
      </UserContext.Provider>
    ),
    RouterDecorator,
    ComponentDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof SettingsRoleAssignmentWrapper>;

export const Default: Story = {
  args: {
    roleId: mockedRoles[0].id,
  },
};

export const PendingRole: Story = {
  args: {
    roleId: 'newRoleId',
  },
};
