import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

// System objects are technical tables that would confuse non-technical users, so pickers list them under "Advanced".
export const isAdvancedRelationTargetObjectMetadata = (
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'isSystem' | 'nameSingular'
  >,
) =>
  objectMetadataItem.isSystem &&
  objectMetadataItem.nameSingular !== CoreObjectNameSingular.WorkspaceMember;
