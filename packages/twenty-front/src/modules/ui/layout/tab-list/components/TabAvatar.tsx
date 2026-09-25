import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { useTheme } from 'twenty-ui/theme';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const TabAvatar = ({ tab }: { tab: SingleTabProps }) => {
  const theme = useTheme();

  if (isDefined(tab.logo)) {
    return (
      <Avatar src={getAbsoluteImageUrl(tab.logo)} size="md" name={tab.title} />
    );
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
