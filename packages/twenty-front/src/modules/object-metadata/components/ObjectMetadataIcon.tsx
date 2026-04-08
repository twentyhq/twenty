import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { TintedIconTile, useIcons } from 'twenty-ui/display';

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
  size,
  stroke,
}: ObjectMetadataIconProps) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(objectMetadataItem?.icon);

  return (
    <TintedIconTile
      Icon={Icon}
      color={getObjectColorWithFallback(objectMetadataItem)}
      size={size}
      stroke={stroke}
    />
  );
};
