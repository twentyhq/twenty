import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useGetButtonIcon } from '@/object-record/record-field/ui/hooks/useGetButtonIcon';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';

import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellButtons } from '@/object-record/record-table/record-table-cell/components/RecordTableCellButtons';
import { useGetSecondaryRecordTableCellButton } from '@/object-record/record-table/record-table-cell/hooks/useGetSecondaryRecordTableCellButton';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { getCreatableActivityObjectNameSingularFromField } from '@/object-record/record-table/record-table-cell/utils/getCreatableActivityObjectNameSingularFromField';
import { useContext } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowUpRight,
  IconCheckbox,
  IconNotes,
  IconPencil,
} from 'twenty-ui/icon';

export const RecordTableCellEditButton = () => {
  const { cellPosition } = useContext(RecordTableCellContext);
  const { fieldDefinition, recordId, isRecordFieldReadOnly } =
    useContext(FieldContext);
  const { objectNameSingular } = useRecordTableRowContextOrThrow();
  const { openTableCell } = useOpenRecordTableCellFromCell();
  const isFieldInputOnly = useIsFieldInputOnly();
  const isFirstColumn = cellPosition.column === 0;
  const customButtonIcon = useGetButtonIcon();

  const secondaryButton = useGetSecondaryRecordTableCellButton();

  const creatableActivityObjectNameSingular =
    getCreatableActivityObjectNameSingularFromField({
      fieldName: fieldDefinition.metadata.fieldName,
      fieldType: fieldDefinition.type,
      objectNameSingular,
      isRecordFieldReadOnly,
    });

  const openCreateActivityDrawer = useOpenCreateActivityDrawer({
    activityObjectNameSingular:
      creatableActivityObjectNameSingular ?? CoreObjectNameSingular.Note,
  });

  const getMainButtonIcon = () => {
    if (isFirstColumn) {
      return IconArrowUpRight;
    }
    if (creatableActivityObjectNameSingular === CoreObjectNameSingular.Note) {
      return IconNotes;
    }
    if (creatableActivityObjectNameSingular === CoreObjectNameSingular.Task) {
      return IconCheckbox;
    }
    return customButtonIcon ?? IconPencil;
  };

  const handleMainButtonClick = () => {
    if (isDefined(creatableActivityObjectNameSingular)) {
      openCreateActivityDrawer({
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
          Icon: getMainButtonIcon(),
        },
      ]}
    />
  );
};
