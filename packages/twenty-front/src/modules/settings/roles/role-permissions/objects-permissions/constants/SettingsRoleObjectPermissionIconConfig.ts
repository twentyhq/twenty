import {
  type IconComponent,
  IconEye,
  IconEyeOff,
  IconForbid,
  IconPencil,
  IconPencilOff,
  IconPlus,
  IconTrash,
  IconTrashOff,
  IconTrashX,
  IconTrashXOff,
} from 'twenty-ui/icon';

type SettingsRoleObjectPermissionIconConfig = {
  Icon: IconComponent;
  IconForbidden: IconComponent;
};

export type SettingsRoleObjectPermissionKey =
  | 'canReadObjectRecords'
  | 'canUpdateObjectRecords'
  | 'canSoftDeleteObjectRecords'
  | 'canDestroyObjectRecords'
  | 'canCreateObjectRecords';

export const SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG: Record<
  SettingsRoleObjectPermissionKey,
  SettingsRoleObjectPermissionIconConfig
> = {
  canReadObjectRecords: {
    Icon: IconEye,
    IconForbidden: IconEyeOff,
  },
  canCreateObjectRecords: {
    Icon: IconPlus,
    IconForbidden: IconForbid,
  },
  canUpdateObjectRecords: {
    Icon: IconPencil,
    IconForbidden: IconPencilOff,
  },
  canSoftDeleteObjectRecords: {
    Icon: IconTrash,
    IconForbidden: IconTrashOff,
  },
  canDestroyObjectRecords: {
    Icon: IconTrashX,
    IconForbidden: IconTrashXOff,
  },
};
