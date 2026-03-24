import {
  type IconComponent,
  IconEye,
  IconEyeOff,
  IconLayoutSidebarRight,
  IconLayoutSidebarRightCollapse,
  IconPencil,
  IconPencilOff,
  IconTrash,
  IconTrashOff,
  IconTrashX,
  IconTrashXOff,
} from 'twenty-ui/display';

type SettingsRoleObjectPermissionIconConfig = {
  Icon: IconComponent;
  IconForbidden: IconComponent;
};

export type SettingsRoleObjectPermissionKey =
  | 'canReadObjectRecords'
  | 'canUpdateObjectRecords'
  | 'canSoftDeleteObjectRecords'
  | 'canDestroyObjectRecords'
  | 'showInSidebar';

export const SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG: Record<
  SettingsRoleObjectPermissionKey,
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
    IconForbidden: IconTrashXOff,
  },
  showInSidebar: {
    Icon: IconLayoutSidebarRight,
    IconForbidden: IconLayoutSidebarRightCollapse,
  },
};
