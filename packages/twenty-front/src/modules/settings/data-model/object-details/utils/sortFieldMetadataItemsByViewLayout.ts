import { isDefined } from 'twenty-shared/utils';

type FieldMetadataLayoutSortable = {
  id: string;
  label: string;
};

export const sortFieldMetadataItemsByViewLayout = <
  TField extends FieldMetadataLayoutSortable,
>({
  fieldMetadataItems,
  positionByFieldMetadataId,
}: {
  fieldMetadataItems: TField[];
  positionByFieldMetadataId: Map<string, number>;
}): TField[] =>
  [...fieldMetadataItems].sort((fieldA, fieldB) => {
    const positionA = positionByFieldMetadataId.get(fieldA.id);
    const positionB = positionByFieldMetadataId.get(fieldB.id);

    if (isDefined(positionA) && isDefined(positionB)) {
      if (positionA !== positionB) {
        return positionA - positionB;
      }

      return fieldA.label.localeCompare(fieldB.label);
    }

    if (isDefined(positionA)) {
      return -1;
    }

    if (isDefined(positionB)) {
      return 1;
    }

    return fieldA.label.localeCompare(fieldB.label);
  });
