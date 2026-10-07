import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const ID_FIELD_NAME = 'id';

// The chip edits the slot through one concrete field. A relation binding carries the target object, so it
// is preferred over a chart bound through its own id, which only says "records of this object".
export const getDashboardFilterRepresentativeBinding = ({
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
    fields: Pick<FieldMetadataItem, 'id' | 'name' | 'type'>[];
  }[];
}): DashboardFilterBinding | undefined => {
  const slotBindings = Object.values(bindingsByWidgetId)
    .map((bindings) => bindings[slotId])
    .filter(isDefined);

  const isIdBinding = (binding: DashboardFilterBinding) => {
    const boundField = objectMetadataItems
      .flatMap((objectMetadataItem) => objectMetadataItem.fields)
      .find((field) => field.id === binding.fieldMetadataId);

    return (
      isDefined(boundField) &&
      boundField.name === ID_FIELD_NAME &&
      boundField.type === FieldMetadataType.UUID
    );
  };

  return (
    slotBindings.find((binding) => !isIdBinding(binding)) ?? slotBindings[0]
  );
};
