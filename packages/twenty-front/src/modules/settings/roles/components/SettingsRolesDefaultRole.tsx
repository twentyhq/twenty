import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { Select } from '@/ui/input/components/Select';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { isDefined } from 'twenty-shared/utils';
import { IconUserPin } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { useMutation } from '@apollo/client/react';
import {
  type UpdateWorkspaceMutation,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

type SettingsRoleDefaultRoleProps = {
  roles: RoleWithPartialMembers[];
  divider?: boolean;
};

export const SettingsRoleDefaultRole = ({
  roles,
  divider,
}: SettingsRoleDefaultRoleProps) => {
  const { t } = useLingui();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const defaultRole = currentWorkspace?.defaultRole;

  const updateDefaultRole = (
    defaultRoleId: string | null,
    currentWorkspace: CurrentWorkspace,
  ) => {
    updateWorkspace({
      variables: {
        input: {
          defaultRoleId: isDefined(defaultRoleId) ? defaultRoleId : null,
        },
      },
      onCompleted: (data: UpdateWorkspaceMutation) => {
        const defaultRole = data.updateWorkspace.defaultRole;

        setCurrentWorkspace({
          ...currentWorkspace,
          defaultRole: isDefined(defaultRole) ? defaultRole : null,
        });
      },
    });
  };

  const { getIcon } = useIcons();

  if (!currentWorkspace || !defaultRole) {
    return null;
  }

  const options = roles
    .filter((role) => role.canBeAssignedToUsers)
    .map((role) => ({
      label: role.label,
      value: role.id,
      Icon: getIcon(role.icon) ?? IconUserPin,
    }));

  if (options.length === 0) {
    return null;
  }

  return (
    <SettingsOptionCardContentSelect
      Icon={IconUserPin}
      title={t`Default Role`}
      description={t`For members who join without a role or lose theirs`}
      divider={divider}
    >
      <Select<string>
        selectSizeVariant="small"
        withSearchInput
        dropdownId="default-role-select"
        options={options}
        value={defaultRole?.id ?? ''}
        onChange={(value) => updateDefaultRole(value, currentWorkspace)}
      />
    </SettingsOptionCardContentSelect>
  );
};
