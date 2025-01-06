import { RoleTypeLabel } from '@/settings/roles/utils/getRoleTypeLabel';
import { Tag } from 'twenty-ui';

type SettingsRoleTypeTagProps = {
  roleTypeLabel: RoleTypeLabel;
  className?: string;
};

export const SettingsRoleTypeTag = ({
  className,
  roleTypeLabel,
}: SettingsRoleTypeTagProps) => {
  return (
    <Tag
      className={className}
      color={roleTypeLabel.labelColor}
      text={roleTypeLabel.labelText}
      weight="medium"
    />
  );
};
