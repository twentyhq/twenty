import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { type IconComponent } from 'twenty-ui/display';
import { type ThemeColor } from 'twenty-ui/theme';

export type ObjectMetadataItemForSelectIcon = Pick<
  EnrichedObjectMetadataItem,
  'icon' | 'nameSingular' | 'color' | 'isSystem'
>;

export const getSelectIconPropsFromObjectMetadataItem = (
  getIcon: (
    iconKey?: string | null,
    customDefaultIcon?: string,
  ) => IconComponent,
  objectMetadataItem: ObjectMetadataItemForSelectIcon,
): { Icon: IconComponent; iconThemeColor: ThemeColor } => ({
  Icon: getIcon(objectMetadataItem.icon),
  iconThemeColor: getObjectColorWithFallback(objectMetadataItem),
});
