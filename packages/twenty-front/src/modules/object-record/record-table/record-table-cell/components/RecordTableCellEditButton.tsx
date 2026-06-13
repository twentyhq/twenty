import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useGetButtonIcon } from '@/object-record/record-field/ui/hooks/useGetButtonIcon';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';

import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellButtons } from '@/object-record/record-table/record-table-cell/components/RecordTableCellButtons';
import { useGetSecondaryRecordTableCellButton } from '@/object-record/record-table/record-table-cell/hooks/useGetSecondaryRecordTableCellButton';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { useContext } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowUpRight,
  IconCheckbox,
  IconNotes,
  IconPencil,
} from 'twenty-ui-deprecated/display';

export const RecordTableCellEditButton = () => {
  const { cellPosition } = useContext(RecordTableCellContext);
  const { fieldDefinition, recordId } = useContext(FieldContext);
  const { objectNameSingular } = useRecordTableRowContextOrThrow();
  const { openTableCell } = useOpenRecordTableCellFromCell();
  const isFieldInputOnly = useIsFieldInputOnly();
  const isFirstColumn = cellPosition.column === 0;
  const customButtonIcon = useGetButtonIcon();

  const secondaryButton = useGetSecondaryRecordTableCellButton();

  const fieldName = fieldDefinition.metadata.fieldName;
  const isNoteTargetField =
    fieldName === 'noteTargets' &&
    objectNameSingular !== CoreObjectNameSingular.Note;
  const isTaskTargetField =
    fieldName === 'taskTargets' &&
    objectNameSingular !== CoreObjectNameSingular.Task;
  const isActivityTargetOnNonActivityObject =
    isNoteTargetField || isTaskTargetField;

  const openCreateActivity = useOpenCreateActivityDrawer({
    activityObjectNameSingular: isNoteTargetField
      ? CoreObjectNameSingular.Note
      : CoreObjectNameSingular.Task,
  });

  const mainButtonIcon = isFirstColumn
    ? IconArrowUpRight
    : isNoteTargetField
      ? IconNotes
      : isTaskTargetField
        ? IconCheckbox
        : isDefined(customButtonIcon)
          ? customButtonIcon
          : IconPencil;

  const handleMainButtonClick = () => {
    if (isActivityTargetOnNonActivityObject) {
      openCreateActivity({
        targetableObjects: [
          {
            id: recordId,
            targetObjectNameSingular: objectNameSingular,
          },
        ],
      });
      return;
    }
    if (!isFieldInputOnly && isFirstColumn) {
      openTableCell(undefined, true);
    } else {
      openTableCell();
    }
  };

  return (
    <RecordTableCellButtons
      buttons={[
        ...secondaryButton,
        {
          onClick: handleMainButtonClick,
          Icon: mainButtonIcon,
        },
      ]}
    />
  );
};
