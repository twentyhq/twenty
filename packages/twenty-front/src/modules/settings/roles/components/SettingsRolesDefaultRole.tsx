import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { Select } from '@/ui/input/components/Select';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { H2Title, IconUserPin, useIcons } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import {
  type UpdateWorkspaceMutation,
  useUpdateWorkspaceMutation,
} from '~/generated-metadata/graphql';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

type SettingsRoleDefaultRoleProps = {
  roles: RoleWithPartialMembers[];
};

export const SettingsRoleDefaultRole = ({
  roles,
}: SettingsRoleDefaultRoleProps) => {
  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
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

  const options = roles.map((role) => ({
    label: role.label,
    value: role.id,
    Icon: getIcon(role.icon) ?? IconUserPin,
  }));

  if (options.length === 0) {
    return null;
  }

  return (
    <Section>
      <H2Title
        title={t`Options`}
        description={t`Adjust the role-related settings`}
      />
      <Card rounded>
        <SettingsOptionCardContentSelect
          Icon={IconUserPin}
          title={t`Default Role`}
          description={t`Set a default role for this workspace`}
        >
          <Select
            selectSizeVariant="small"
            withSearchInput
            dropdownId="default-role-select"
            options={options}
            value={defaultRole?.id ?? ''}
            onChange={(value) =>
              updateDefaultRole(value as string, currentWorkspace)
            }
          />
        </SettingsOptionCardContentSelect>
      </Card>
    </Section>
  );
};
