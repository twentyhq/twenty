import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { getIconTileColorShades } from 'twenty-ui/primitives/data-display';
import { useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme-constants';

export type ObjectMetadataIconInput = Pick<
  EnrichedObjectMetadataItem,
  'icon' | 'nameSingular' | 'color' | 'isSystem'
>;

export type ObjectMetadataIconProps = {
  objectMetadataItem?: ObjectMetadataIconInput | null;
  size?: number;
  stroke?: number;
};

export const ObjectMetadataIcon = ({
  objectMetadataItem,
  size = 16,
  stroke,
}: ObjectMetadataIconProps) => {
  const { getIcon } = useIcons();
  const theme = useTheme();
  const Icon = getIcon(objectMetadataItem?.icon);

  return (
    <Icon
      color={
        getIconTileColorShades(getObjectColorWithFallback(objectMetadataItem))
          .iconColor
      }
      size={size}
      stroke={stroke ?? theme.icon.stroke.md}
      style={{ flexShrink: 0 }}
    />
  );
};
