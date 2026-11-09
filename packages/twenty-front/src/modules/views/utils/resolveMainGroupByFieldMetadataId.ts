import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const resolveMainGroupByFieldMetadataId = ({
  availableFieldsForGrouping,
  currentMainGroupByFieldMetadataId,
}: {
  availableFieldsForGrouping: Pick<FieldMetadataItem, 'id' | 'type'>[];
  currentMainGroupByFieldMetadataId?: string | null;
}): string | undefined => {
  const currentField = availableFieldsForGrouping.find(
    (field) => field.id === currentMainGroupByFieldMetadataId,
  );

  if (isDefined(currentField)) {
    return currentField.id;
  }

  const firstSelectField = availableFieldsForGrouping.find(
    (field) => field.type === FieldMetadataType.SELECT,
  );

  return firstSelectField?.id ?? availableFieldsForGrouping[0]?.id;
};
