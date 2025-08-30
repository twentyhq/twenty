import { labelIdentifierFieldMetadataItemSelector } from '@/object-metadata/states/labelIdentifierFieldMetadataItemSelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useRecordIndexFieldMetadataDerivedStates = (
  objectMetadataItem: ObjectMetadataItem | undefined,
  recordIndexId?: string | undefined,
) => {
  const fieldMetadataItems = objectMetadataItem?.fields ?? [];

  const fieldMetadataItemByFieldMetadataItemId = Object.fromEntries(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.id,
      fieldMetadataItem,
    ]),
  );

  const currentRecordFields = useRecoilComponentValue(
    currentRecordFieldsComponentState,
    recordIndexId,
  );

  const recordFieldByFieldMetadataItemId = Object.fromEntries(
    currentRecordFields.map((recordField) => [
      recordField.fieldMetadataItemId,
      recordField,
    ]),
  );

  const fieldDefinitionByFieldMetadataItemId = isDefined(objectMetadataItem)
    ? Object.fromEntries(
        fieldMetadataItems.map((fieldMetadataItem) => [
          fieldMetadataItem.id,
          formatFieldMetadataItemAsColumnDefinition({
            field: fieldMetadataItem,
            objectMetadataItem,
            position:
              recordFieldByFieldMetadataItemId[fieldMetadataItem.id]
                ?.position ?? 0,
            labelWidth:
              recordFieldByFieldMetadataItemId[fieldMetadataItem.id]?.size ?? 0,
          }),
        ]),
      )
    : {};

  const labelIdentifierFieldMetadataItem = useRecoilValue(
    labelIdentifierFieldMetadataItemSelector({
      objectMetadataItemId: objectMetadataItem?.id ?? '',
    }),
  );

  return {
    fieldMetadataItemByFieldMetadataItemId,
    labelIdentifierFieldMetadataItem,
    fieldDefinitionByFieldMetadataItemId,
    recordFieldByFieldMetadataItemId,
  };
};
