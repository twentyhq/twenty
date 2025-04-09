import { ObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';
import { Tag } from 'twenty-ui/components';

type SettingsDataModelObjectTypeTagProps = {
  objectTypeLabel: ObjectTypeLabel;
  className?: string;
};

export const SettingsDataModelObjectTypeTag = ({
  className,
  objectTypeLabel,
}: SettingsDataModelObjectTypeTagProps) => {
  return (
    <Tag
      className={className}
      color={objectTypeLabel.labelColor}
      text={objectTypeLabel.labelText}
      weight="medium"
    />
  );
};
