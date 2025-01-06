export type RoleTypeLabel =
  | StandardRoleTypeLabel
  | CustomRoleTypeLabel
  | RemoteRoleTypeLabel;

type StandardRoleTypeLabel = {
  labelText: 'Standard';
  labelColor: 'blue';
};

type CustomRoleTypeLabel = {
  labelText: 'Custom';
  labelColor: 'orange';
};

type RemoteRoleTypeLabel = {
  labelText: 'Remote';
  labelColor: 'green';
};

type Role = {
  isCustom: boolean;
  isRemote: boolean;
};

export const getRoleTypeLabel = (roleMetadataItem: Role): RoleTypeLabel =>
  roleMetadataItem.isCustom
    ? {
        labelText: 'Custom',
        labelColor: 'orange',
      }
    : roleMetadataItem.isRemote
    ? {
          labelText: 'Remote',
          labelColor: 'green',
      }
    : {
          labelText: 'Standard',
          labelColor: 'blue',
      };
