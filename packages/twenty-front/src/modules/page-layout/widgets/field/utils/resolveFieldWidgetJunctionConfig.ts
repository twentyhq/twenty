import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { type JunctionObjectMetadataItem } from '@/object-record/record-field/ui/utils/junction/types/JunctionObjectMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type ResolveFieldWidgetJunctionConfigArgs = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItems: JunctionObjectMetadataItem[];
};

export type FieldWidgetJunctionConfig = NonNullable<
  ReturnType<typeof resolveJunctionConfig>
>;

export const resolveFieldWidgetJunctionConfig = ({
  fieldMetadataItem,
  objectMetadataItems,
}: ResolveFieldWidgetJunctionConfigArgs): FieldWidgetJunctionConfig | null => {
  if (
    fieldMetadataItem.type !== FieldMetadataType.RELATION ||
    !isDefined(fieldMetadataItem.relation)
  ) {
    return null;
  }

  return resolveJunctionConfig({
    settings: fieldMetadataItem.settings,
    relationObjectMetadataId:
      fieldMetadataItem.relation.targetObjectMetadata.id,
    relationTargetFieldMetadataId:
      fieldMetadataItem.relation.targetFieldMetadata.id,
    sourceObjectMetadataId: fieldMetadataItem.relation.sourceObjectMetadata.id,
    objectMetadataItems,
  });
};
