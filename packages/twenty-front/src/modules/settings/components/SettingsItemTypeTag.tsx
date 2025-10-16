import { Tag } from 'twenty-ui/components';
import { getItemTagInfo } from '@/settings/data-model/utils/getItemTagInfo';

type SettingsItemTypeTagProps = {
  item: {
    isCustom?: boolean;
    isRemote?: boolean;
    applicationId?: string | null;
  };
  className?: string;
};

export const SettingsItemTypeTag = ({
  className,
  item: { isCustom, isRemote, applicationId },
}: SettingsItemTypeTagProps) => {
  const itemTagInfo = getItemTagInfo({ isCustom, isRemote, applicationId });

  return (
    <Tag
      className={className}
      color={itemTagInfo.labelColor}
      text={itemTagInfo.labelText}
      weight="medium"
    />
  );
};
