import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon/provider';
import { useTheme } from 'twenty-ui/theme';

import { getNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getNavigationMenuItemColor';
import { SettingsApplicationContentTypeIcon } from '@/settings/applications/components/SettingsApplicationContentTypeIcon';
import { useApplicationContentItemDisplay } from '@/settings/applications/hooks/useApplicationContentItemDisplay';
import { useApplicationContentObjectResolver } from '@/settings/applications/hooks/useApplicationContentObjectResolver';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { isNavigationMenuItemType } from '@/settings/applications/utils/isNavigationMenuItemType';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';

type SettingsApplicationContentItemIconProps = {
  contentType: ApplicationContentType;
  content: ApplicationContent;
  item: ApplicationContentItem;
};

export const SettingsApplicationContentItemIcon = ({
  contentType,
  content,
  item,
}: SettingsApplicationContentItemIconProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const resolveObject = useApplicationContentObjectResolver(content);
  const { getItemIcon } = useApplicationContentItemDisplay(content);

  const itemIcon = getItemIcon({ contentType, item });

  if (!isNonEmptyString(itemIcon)) {
    return <SettingsApplicationContentTypeIcon contentType={contentType} />;
  }

  const getItemColor = () => {
    switch (contentType) {
      case 'objects':
        return resolveObject(item.universalIdentifier)?.color;
      case 'navigationMenuItems': {
        if (!isDefined(item.tag) || !isNavigationMenuItemType(item.tag)) {
          return undefined;
        }

        return getNavigationMenuItemColor(
          { type: item.tag, color: item.color },
          resolveObject(item.objectUniversalIdentifier)?.colorSource,
        );
      }
      default:
        return undefined;
    }
  };

  const ItemIcon = getIcon(itemIcon);
  const itemColor = getItemColor();

  if (!isDefined(itemColor)) {
    return <ItemIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />;
  }

  return (
    <ColoredIcon
      Icon={ItemIcon}
      color={itemColor}
      stroke={theme.icon.stroke.sm}
    />
  );
};
