import { useContext } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useSetRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { FieldContext } from '../contexts/FieldContext';

export const useClearField = () => {
  const {
    recordId,
    fieldDefinition,
    useUpdateRecord = () => [],
  } = useContext(FieldContext);

  const [updateRecord] = useUpdateRecord();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const setRecordFieldValue = useSetRecordFieldValue();

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
          workspaceMemberId: currentWorkspaceMember?.id,
        });

        set(
          recordStoreFamilySelector({ recordId, fieldName }),
          emptyFieldValue,
        );

        setRecordFieldValue(recordId, fieldName, emptyFieldValue);

        updateRecord?.({
          variables: {
            where: { id: recordId },
            updateOneRecordInput: {
              [fieldName]: emptyFieldValue,
            },
          },
        });
      },
    [
      recordId,
      fieldDefinition,
      currentWorkspaceMember,
      updateRecord,
      setRecordFieldValue,
    ],
  );

  return clearField;
};
