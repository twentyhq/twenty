import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const ID_FIELD_NAME = 'id';

// A RELATION slot has no stored target: the first bound widget tells which object its values are records of.
export const getDashboardFilterSlotRelationTargetObjectMetadataId = ({
  slotId,
  bindingsByWidgetId,
  objectMetadataItems,
}: {
  slotId: string;
  bindingsByWidgetId: Record<
    string,
    Record<string, DashboardFilterBinding | null>
  >;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): string | undefined =>
  Object.values(bindingsByWidgetId)
    .map((bindings) => bindings[slotId])
    .filter(isDefined)
    .map((binding) => {
      const { fieldMetadataItem, objectMetadataItem } =
        getFieldMetadataItemById({
          fieldMetadataId: binding.fieldMetadataId,
          objectMetadataItems,
        });

      if (!isDefined(fieldMetadataItem)) {
        return undefined;
      }

      if (fieldMetadataItem.name === ID_FIELD_NAME) {
        return objectMetadataItem?.id;
      }

      return isManyToOneRelationField(fieldMetadataItem)
        ? fieldMetadataItem.relation.targetObjectMetadata.id
        : undefined;
    })
    .find(isDefined);
