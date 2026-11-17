import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const getRelationTargetRecordFilterLabel = ({
  sourceFieldMetadataItem,
  relationTargetFieldMetadataItem,
}: {
  sourceFieldMetadataItem: Pick<FieldMetadataItem, 'label'>;
  relationTargetFieldMetadataItem: Pick<FieldMetadataItem, 'label'>;
}) =>
  `${sourceFieldMetadataItem.label} → ${relationTargetFieldMetadataItem.label}`;
