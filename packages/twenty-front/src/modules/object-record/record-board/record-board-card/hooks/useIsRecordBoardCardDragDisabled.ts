import { getFieldPermissions } from '@/object-metadata/utils/getFieldPermissions';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { isRecordBoardCellsNonEditableComponentState } from '@/object-record/record-board/states/isRecordBoardCellsNonEditableComponentState';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

// Moving a card writes the column value into its group field, so the drag is
// only offered to members allowed to update that field.
export const useIsRecordBoardCardDragDisabled = (recordId: string) => {
  const { objectMetadataItem, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
    objectMetadataId: objectMetadataItem.id,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const isRecordBoardCellsNonEditable = useAtomComponentStateValue(
    isRecordBoardCellsNonEditableComponentState,
  );

  const selectFieldIsReadOnly =
    isDefined(selectFieldMetadataItem) &&
    (selectFieldMetadataItem.isUIEditable === false ||
      !getFieldPermissions({
        objectPermissions,
        fieldMetadataId: selectFieldMetadataItem.id,
      }).canUpdateField);

  return (
    isRecordBoardCellsNonEditable || isRecordReadOnly || selectFieldIsReadOnly
  );
};
