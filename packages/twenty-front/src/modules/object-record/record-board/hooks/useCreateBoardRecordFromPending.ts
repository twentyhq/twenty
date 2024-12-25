import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from '~/utils/isDefined';

import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { RecordForSelect } from '@/object-record/relation-picker/types/RecordForSelect';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { RecordBoardContext } from '../contexts/RecordBoardContext';
import { recordBoardPendingRecordIdByColumnComponentFamilyState } from '../states/recordBoardPendingRecordIdByColumnComponentFamilyState';

export const useCreateBoardRecordFromPending = (recordBoardId: string) => {
  const { objectMetadataItem, selectFieldMetadataItem, createOneRecord } =
    useContext(RecordBoardContext);
  const columnContext = useContext(RecordBoardColumnContext);

  const recordBoardPendingRecordIdByColumnState =
    useRecoilComponentCallbackStateV2(
      recordBoardPendingRecordIdByColumnComponentFamilyState,
      recordBoardId,
    );

  const createBoardRecordFromPending = useRecoilCallback(
    ({ snapshot, set }) =>
      async (
        columnId: string,
        labelValue?: string,
        company?: RecordForSelect,
      ) => {
        const pendingRecord = snapshot
          .getLoadable(recordBoardPendingRecordIdByColumnState(columnId))
          .getValue();

        if (!pendingRecord.recordId) {
          return;
        }

        const { isOpportunity, position } = pendingRecord;
        set(recordBoardPendingRecordIdByColumnState(columnId), {
          recordId: null,
          isOpportunity: false,
          position: undefined,
          company: null,
        });

        if (!isOpportunity && labelValue !== '') {
          const labelIdentifierField = objectMetadataItem?.fields.find(
            (field) =>
              field.id === objectMetadataItem.labelIdentifierFieldMetadataId,
          );

          if (!isDefined(labelIdentifierField)) {
            throw new Error('Label identifier field not found');
          }

          let computedLabelIdentifierValue: any = labelValue;

          if (labelIdentifierField.type === FieldMetadataType.FullName) {
            computedLabelIdentifierValue = {
              firstName: labelValue,
              lastName: '',
            };
          }

          await createOneRecord({
            [selectFieldMetadataItem.name]:
              columnContext?.columnDefinition.value,
            position,
            [labelIdentifierField.name]: computedLabelIdentifierValue,
          });
        }

        if (isOpportunity && isDefined(company)) {
          await createOneRecord({
            [selectFieldMetadataItem.name]:
              columnContext?.columnDefinition.value,
            position,
            companyId: company.id,
            name: company.name,
          });
        }
      },
    [
      objectMetadataItem,
      selectFieldMetadataItem,
      createOneRecord,
      recordBoardPendingRecordIdByColumnState,
      columnContext,
    ],
  );

  return {
    createBoardRecordFromPending,
  };
};
