import { useLingui } from '@lingui/react/macro';
import { Avatar } from 'twenty-ui/primitives/data-display';

type NavigationMenuItemRecordAvatarProps = {
  className?: string;
};

export const NavigationMenuItemRecordAvatar = ({
  className,
}: NavigationMenuItemRecordAvatarProps) => {
  const { t } = useLingui();

  return (
    <Avatar className={className} name={t`Record`} shape="circle" size="md" />
  );
};
