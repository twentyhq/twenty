import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { useRecordTitleCell } from '@/object-record/record-title-cell/hooks/useRecordTitleCell';
import { AppPath } from '@/types/AppPath';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useRecordBoardAddNewRecord = () => {
  const columnContext = useContext(RecordBoardColumnContext);
  const { createOneRecord, selectFieldMetadataItem, objectMetadataItem } =
    useContext(RecordBoardContext);

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();
  const { openRecordTitleCell } = useRecordTitleCell();
  const navigate = useNavigateApp();

  const createNewBoardRecord = useRecoilCallback(
    ({ snapshot }) =>
      async (position: 'first' | 'last' | number) => {
        const recordId = v4();

        const recordIndexOpenRecordIn = snapshot
          .getLoadable(recordIndexOpenRecordInState)
          .getValue();

        await createOneRecord({
          id: recordId,
          [selectFieldMetadataItem.name]: columnContext?.columnDefinition.value,
          position: position,
        });

        if (recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL) {
          openRecordInCommandMenu({
            recordId,
            objectNameSingular: objectMetadataItem.nameSingular,
            isNewRecord: true,
          });

          openRecordTitleCell({
            recordId,
            fieldMetadataId: objectMetadataItem.labelIdentifierFieldMetadataId,
          });
        } else {
          navigate(AppPath.RecordShowPage, {
            objectNameSingular: objectMetadataItem.nameSingular,
            objectRecordId: recordId,
          });
        }
      },
    [
      columnContext?.columnDefinition.value,
      createOneRecord,
      navigate,
      objectMetadataItem.labelIdentifierFieldMetadataId,
      objectMetadataItem.nameSingular,
      openRecordInCommandMenu,
      openRecordTitleCell,
      selectFieldMetadataItem.name,
    ],
  );

  return {
    createNewBoardRecord,
  };
};
