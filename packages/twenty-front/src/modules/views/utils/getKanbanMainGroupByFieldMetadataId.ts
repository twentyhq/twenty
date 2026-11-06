import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

// A relation only gets the empty group when the server builds view groups,
// so a select field makes a better default board than the first field.
export const getKanbanMainGroupByFieldMetadataId = ({
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
