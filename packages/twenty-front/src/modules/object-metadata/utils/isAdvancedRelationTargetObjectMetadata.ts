import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

// Pickers list system objects under an "Advanced" section, away from business objects.
export const isAdvancedRelationTargetObjectMetadata = (
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'isSystem' | 'nameSingular'
  >,
) =>
  objectMetadataItem.isSystem &&
  objectMetadataItem.nameSingular !== CoreObjectNameSingular.WorkspaceMember;
