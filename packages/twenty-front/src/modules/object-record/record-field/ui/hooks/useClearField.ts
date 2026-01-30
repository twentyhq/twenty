import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

export const useClearField = () => {
  const {
    recordId,
    fieldDefinition,
    useUpdateRecord = () => [],
  } = useContext(FieldContext);

  const [updateRecord] = useUpdateRecord();

  const clearField = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        const foundObjectMetadataItem = objectMetadataItems.find(
          (item) =>
            item.nameSingular ===
            fieldDefinition.metadata.objectMetadataNameSingular,
        );

        const foundFieldMetadataItem = foundObjectMetadataItem?.fields.find(
          (field) => field.name === fieldDefinition.metadata.fieldName,
        );

        if (!foundObjectMetadataItem || !foundFieldMetadataItem) {
          throw new Error('Field metadata item cannot be found');
        }

        const fieldName = fieldDefinition.metadata.fieldName;

        const emptyFieldValue = generateEmptyFieldValue({
          fieldMetadataItem: foundFieldMetadataItem,
        });

        set(
          recordStoreFamilySelector({ recordId, fieldName }),
          emptyFieldValue,
        );

        updateRecord?.({
          variables: {
            where: { id: recordId },
            updateOneRecordInput: {
              [fieldName]: emptyFieldValue,
            },
          },
        });
      },
    [recordId, fieldDefinition, updateRecord],
  );

  return clearField;
};
