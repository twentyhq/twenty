import { type MetadataOwner } from '@/metadata/types/metadata-owner.type';
import { colorText } from '@/output/style';

export const formatMetadataOwner = (owner: MetadataOwner) => {
  switch (owner.kind) {
    case 'standard':
      return 'Standard';
    case 'custom':
      return colorText('cyan', 'Custom');
    case 'application':
      return colorText('magenta', owner.name ?? 'Unknown app');
    case 'unknown':
      return colorText('yellow', 'Unknown');
  }
};
