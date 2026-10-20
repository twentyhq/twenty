import { type SettingsRoleObjectAccessLevel } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectAccessLevel';
import { t } from '@lingui/core/macro';
import {
  IconAdjustments,
  IconEye,
  IconEyeOff,
  IconLockOpen,
  IconPencil,
} from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';

export const getObjectAccessLevelSelectOptions =
  (): SelectOption<SettingsRoleObjectAccessLevel>[] => [
    { value: 'NO_ACCESS', label: t`No access`, Icon: IconEyeOff },
    { value: 'READ', label: t`See`, Icon: IconEye },
    { value: 'EDIT', label: t`Edit`, Icon: IconPencil },
    { value: 'EVERYTHING', label: t`Everything`, Icon: IconLockOpen },
    { value: 'ADVANCED', label: t`Advanced`, Icon: IconAdjustments },
  ];
