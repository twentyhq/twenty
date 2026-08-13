import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

// System objects are valid relation targets, but they are technical tables that
// would confuse less technical users, so pickers list them under an "Advanced"
// section instead of next to business objects.
export const isAdvancedRelationTargetObjectMetadata = (
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'isSystem' | 'nameSingular'
  >,
) =>
  objectMetadataItem.isSystem &&
  objectMetadataItem.nameSingular !== CoreObjectNameSingular.WorkspaceMember;
