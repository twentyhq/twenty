import { type SettingsRoleFieldRestriction } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/types/SettingsRoleFieldRestriction';
import { t } from '@lingui/core/macro';
import { IconEyeOff, IconPencilOff } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';

export const getFieldRestrictionSelectOptions = ({
  canRestrictRead,
  canRestrictUpdate,
}: {
  canRestrictRead: boolean;
  canRestrictUpdate: boolean;
}): SelectOption<SettingsRoleFieldRestriction>[] => [
  {
    value: 'CANNOT_SEE',
    label: t`Can't see`,
    Icon: IconEyeOff,
    disabled: !canRestrictRead,
  },
  {
    value: 'CANNOT_EDIT',
    label: t`Can't edit`,
    Icon: IconPencilOff,
    disabled: !canRestrictUpdate,
  },
];
