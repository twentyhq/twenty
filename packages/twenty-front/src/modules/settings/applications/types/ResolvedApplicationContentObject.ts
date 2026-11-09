import { type ThemeColor } from 'twenty-ui/theme';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export type ResolvedApplicationContentObject = {
  universalIdentifier: string;
  label: string;
  labelSingular?: string;
  icon?: string | null;
  color: ThemeColor;
  colorSource: Pick<
    EnrichedObjectMetadataItem,
    'color' | 'isSystem' | 'nameSingular'
  >;
};
