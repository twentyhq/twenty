import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getItemTagInfo } from '@/settings/data-model/utils/getItemTagInfo';
import { useRecoilState } from 'recoil';
import { Tag } from 'twenty-ui/components';

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
  const [currentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  console.log(currentWorkspace)

  return (
    <Tag
      className={className}
      color={itemTagInfo.labelColor}
      text={itemTagInfo.labelText}
      weight="medium"
    />
  );
};
