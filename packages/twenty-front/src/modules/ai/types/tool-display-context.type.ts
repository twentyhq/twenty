import { type ToolCategory } from 'twenty-shared/ai';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type ToolIndexInfo = {
  category: ToolCategory;
  objectName?: string | null;
};

export type ToolDisplayContext = {
  labelByName: Map<string, string>;
  indexByName: Map<string, ToolIndexInfo>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
};
