import {
  IconComponent,
  IconEye,
  IconEyeOff,
  IconPencil,
  IconPencilOff,
  IconTrash,
  IconTrashOff,
  IconTrashX,
} from 'twenty-ui/display';

type SettingsRoleObjectPermissionIconConfig = {
  Icon: IconComponent;
  IconForbidden: IconComponent;
};

export const SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG: Record<
  string,
  SettingsRoleObjectPermissionIconConfig
> = {
  canReadObjectRecords: {
    Icon: IconEye,
    IconForbidden: IconEyeOff,
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
    IconForbidden: IconTrashX,
  },
};
