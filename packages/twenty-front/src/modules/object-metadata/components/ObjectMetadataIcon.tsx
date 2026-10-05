import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { useIcons } from 'twenty-ui/icon';

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
    <ColoredIcon
      Icon={Icon}
      color={getObjectColorWithFallback(objectMetadataItem)}
      size={size}
      stroke={stroke}
    />
  );
};
