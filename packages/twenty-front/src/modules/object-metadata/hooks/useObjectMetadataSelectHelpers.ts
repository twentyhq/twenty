import { type IconComponent, useIcons } from 'twenty-ui/display';
import { type ThemeColor } from 'twenty-ui/theme';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';

type ObjectMetadataItemForSelectIcon = Pick<
  EnrichedObjectMetadataItem,
  'icon' | 'nameSingular' | 'color' | 'isSystem'
>;

export const useObjectMetadataSelectHelpers = () => {
  const { getIcon } = useIcons();

  const getSelectIconPropsFromObjectMetadataItem = (
    objectMetadataItem: ObjectMetadataItemForSelectIcon,
  ): { Icon: IconComponent; iconThemeColor: ThemeColor } => ({
    Icon: getIcon(objectMetadataItem.icon),
    iconThemeColor: getObjectColorWithFallback(objectMetadataItem),
  });

  return { getSelectIconPropsFromObjectMetadataItem };
};
