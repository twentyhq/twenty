import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const ID_FIELD_NAME = 'id';

// A RELATION slot stores no target: a MANY_TO_ONE binding names it through its relation, and a chart bound
// through its own id IS the target, so the field's owning object is the answer.
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
  objectMetadataItems: {
    id: string;
    fields: Pick<FieldMetadataItem, 'id' | 'name' | 'type' | 'relation'>[];
  }[];
}): string | undefined =>
  Object.values(bindingsByWidgetId)
    .map((bindings) => bindings[slotId])
    .filter(isDefined)
    .map((binding) => {
      const owningObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.fields.some(
            (field) => field.id === binding.fieldMetadataId,
          ),
      );

      const boundField = owningObjectMetadataItem?.fields.find(
        (field) => field.id === binding.fieldMetadataId,
      );

      if (!isDefined(owningObjectMetadataItem) || !isDefined(boundField)) {
        return undefined;
      }

      if (
        boundField.name === ID_FIELD_NAME &&
        boundField.type === FieldMetadataType.UUID
      ) {
        return owningObjectMetadataItem.id;
      }

      return isManyToOneRelationField(boundField)
        ? boundField.relation.targetObjectMetadata.id
        : undefined;
    })
    .find(isDefined);
