import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

// The timelineActivity object carries one morph target field per object whose
// records have a timeline; the reached objects are the morph targets.
export const getTimelineActivityTargetObjectMetadataList = (
  timelineActivityFields: FieldMetadataItem[],
) =>
  timelineActivityFields.flatMap((field) =>
    (field.morphRelations ?? []).map(
      (morphRelation) => morphRelation.targetObjectMetadata,
    ),
  );
