import { SingleTabProps } from '@/ui/layout/tab/components/TabList';
import { useTheme } from '@emotion/react';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/display';

export const TabAvatar = ({ tab }: { tab: SingleTabProps }) => {
  const theme = useTheme();
  if (isDefined(tab.logo)) {
    return <Avatar avatarUrl={tab.logo} size="md" placeholder={tab.title} />;
  }
  return (
    <Avatar
      Icon={tab.Icon}
      size="md"
      placeholder={tab.title}
      iconColor={
        tab.disabled ? theme.font.color.tertiary : theme.font.color.secondary
      }
    />
  );
};
