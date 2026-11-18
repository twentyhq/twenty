import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  type IconComponent,
  IconEye,
  IconEyeOff,
  IconPencil,
  IconPencilOff,
  IconTrash,
  IconTrashOff,
  IconTrashX,
  IconTrashXOff,
} from 'twenty-ui/icon';

type SettingsRoleObjectPermissionIconConfig = {
  Icon: IconComponent;
  IconForbidden: IconComponent;
  label: MessageDescriptor;
};

export type SettingsRoleObjectPermissionKey =
  | 'canReadObjectRecords'
  | 'canUpdateObjectRecords'
  | 'canSoftDeleteObjectRecords'
  | 'canDestroyObjectRecords';

export const SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG: Record<
  SettingsRoleObjectPermissionKey,
  SettingsRoleObjectPermissionIconConfig
> = {
  canReadObjectRecords: {
    Icon: IconEye,
    IconForbidden: IconEyeOff,
    label: msg`See`,
  },
  canUpdateObjectRecords: {
    Icon: IconPencil,
    IconForbidden: IconPencilOff,
    label: msg`Edit`,
  },
  canSoftDeleteObjectRecords: {
    Icon: IconTrash,
    IconForbidden: IconTrashOff,
    label: msg`Delete`,
  },
  canDestroyObjectRecords: {
    Icon: IconTrashX,
    IconForbidden: IconTrashXOff,
    label: msg`Destroy`,
  },
};
