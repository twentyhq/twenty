import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const getRelationTargetFieldLabel = ({
  sourceFieldMetadataItem,
  relationTargetFieldMetadataItem,
}: {
  sourceFieldMetadataItem: Pick<FieldMetadataItem, 'label'>;
  relationTargetFieldMetadataItem: Pick<FieldMetadataItem, 'label'>;
}) =>
  `${sourceFieldMetadataItem.label} → ${relationTargetFieldMetadataItem.label}`;
