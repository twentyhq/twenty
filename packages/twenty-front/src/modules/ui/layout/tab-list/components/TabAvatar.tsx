import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme-constants';

export const TabAvatar = ({ tab }: { tab: SingleTabProps }) => {
  const { theme } = useContext(ThemeContext);

  if (isDefined(tab.logo)) {
    return <Avatar avatarUrl={tab.logo} size="md" placeholder={tab.title} />;
  }
  return (
    tab.Icon && (
      <tab.Icon
        size={theme.icon.size.md}
        color={
          tab.disabled ? theme.font.color.tertiary : theme.font.color.secondary
        }
        stroke={theme.icon.stroke.md}
      />
    )
  );
};
