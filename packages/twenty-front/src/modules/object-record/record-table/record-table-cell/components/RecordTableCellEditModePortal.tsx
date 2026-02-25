import { RecordTableCellPortalWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalWrapper';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { RecordTableCellEditMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditMode';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';
import { RecordTableCellHotkeysEffect } from '@/object-record/record-table/record-table-cell/components/RecordTableCellHotkeysEffect';
import { RecordTableCellPortalRootContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalRootContainer';
import { useCurrentlyFocusedRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/hooks/useCurrentlyFocusedRecordTableCellFocusId';
import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellEditModePortal = () => {
  const focusedCellPosition = useAtomComponentStateValue(
    recordTableFocusPositionComponentState,
  );

  const currentTableCellInEditModePosition = useAtomComponentStateValue(
    recordTableCellEditModePositionComponentState,
  );

  const hasRecordGroups = useAtomComponentSelectorValue(
    hasRecordGroupsComponentSelector,
  );

  const cellFocusId = useCurrentlyFocusedRecordTableCellFocusId();

  if (!isDefined(focusedCellPosition) || !isDefined(cellFocusId)) {
    return null;
  }

  return (
    <RecordTableCellPortalWrapper position={focusedCellPosition}>
      {currentTableCellInEditModePosition && (
        <RecordTableCellPortalRootContainer
          zIndex={
            hasRecordGroups
              ? TABLE_Z_INDEX.cell.withGroups.editMode
              : TABLE_Z_INDEX.cell.withoutGroups.editMode
          }
        >
          <RecordTableCellEditMode>
            <RecordTableCellFieldInput />
          </RecordTableCellEditMode>
        </RecordTableCellPortalRootContainer>
      )}
      <RecordTableCellHotkeysEffect cellFocusId={cellFocusId} />
    </RecordTableCellPortalWrapper>
  );
};
