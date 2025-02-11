import { t } from '@lingui/core/macro';
import { H2Title, IconEye, IconPencil, IconTrash, Section } from 'twenty-ui';
import { Role } from '~/generated-metadata/graphql';
import { RolePermissionsObjectsTableHeader } from '~/pages/settings/roles/components/RolePermissionsObjectsTableHeader';
import { RolePermissionsObjectPermission } from '~/pages/settings/roles/types/RolePermissionsObjectPermission';
import { RolePermissionsObjectsTableRow } from './RolePermissionsObjectsTableRow';

// eslint-disable-next-line unused-imports/no-unused-vars
export const RolePermissions = ({ role }: { role: Role }) => {
  const objectPermissionsConfig: RolePermissionsObjectPermission[] = [
    {
      key: 'seeRecords',
      label: 'See Records on All Objects',
      icon: <IconEye size={16} />,
      value: role.canUpdateAllSettings,
    },
    {
      key: 'editRecords',
      label: 'Edit Records on All Objects',
      icon: <IconPencil size={16} />,
      value: role.canUpdateAllSettings,
    },
    {
      key: 'deleteRecords',
      label: 'Delete Records on All Objects',
      icon: <IconTrash size={16} />,
      value: role.canUpdateAllSettings,
    },
    {
      key: 'destroyRecords',
      label: 'Destroy Records on All Objects',
      icon: <IconTrash size={16} />,
      value: role.canUpdateAllSettings,
    },
  ];

  return (
    <Section>
      <H2Title
        title={t`Objects`}
        description={t`Ability to interact with each objects`}
      />
      <RolePermissionsObjectsTableHeader />
      {objectPermissionsConfig.map((permission) => (
        <RolePermissionsObjectsTableRow
          key={permission.key}
          permission={permission}
        />
      ))}
    </Section>
  );
};
