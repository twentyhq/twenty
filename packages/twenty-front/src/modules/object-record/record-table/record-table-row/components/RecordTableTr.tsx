import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowDiv } from '@/object-record/record-table/record-table-row/components/RecordTableRowDiv';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';

import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { forwardRef, useRef, type ReactNode } from 'react';
import { AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';

// A second click within this window counts as a double-click.
const DOUBLE_CLICK_THRESHOLD_IN_MS = 300;

type RecordTableTrProps = {
  children: ReactNode;
  recordId: string;
  focusIndex: number;
  isDragging?: boolean;
} & Omit<
  React.ComponentProps<typeof RecordTableRowDiv>,
  'isActive' | 'isNextRowActiveOrFocused' | 'isFocused'
>;

export const RecordTableTr = forwardRef<HTMLDivElement, RecordTableTrProps>(
  ({ children, recordId, focusIndex, isDragging = false, ...props }, ref) => {
    const { objectMetadataItem } = useRecordTableContextOrThrow();

    const navigate = useNavigateApp();

    // oxlint-disable-next-line twenty/no-state-useref
    const lastPrimaryClickTimestampRef = useRef<number | null>(null);

    const openRecordInFullPage = (event: React.MouseEvent<HTMLDivElement>) => {
      // Suppress the cell's own click (which would open the side panel / cell
      // editor) so we land cleanly on the full page.
      event.preventDefault();
      event.stopPropagation();
      navigate(AppPath.RecordShowPage, {
        objectNameSingular: objectMetadataItem.nameSingular,
        objectRecordId: recordId,
      });
    };

    // Handled on click *capture* (before the cell's own click handler) so we
    // can both detect the gesture and stop the cell from acting on it. The cell
    // editor portals inside the cell, so a second click still reaches the row
    // here — we time it ourselves rather than rely on the native dblclick,
    // which needs the same target. Option+click opens full page immediately.
    const handleRowClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.altKey) {
        lastPrimaryClickTimestampRef.current = null;
        openRecordInFullPage(event);
        return;
      }

      const now = Date.now();
      const lastTimestamp = lastPrimaryClickTimestampRef.current;
      const isDoubleClick =
        lastTimestamp !== null &&
        now - lastTimestamp < DOUBLE_CLICK_THRESHOLD_IN_MS;

      if (isDoubleClick) {
        lastPrimaryClickTimestampRef.current = null;
        openRecordInFullPage(event);
        return;
      }

      lastPrimaryClickTimestampRef.current = now;
    };

    const isRowSelected = useAtomComponentFamilyStateValue(
      isRowSelectedComponentFamilyState,
      recordId,
    );

    const isRecordTableRowActive = useAtomComponentFamilyStateValue(
      isRecordTableRowActiveComponentFamilyState,
      focusIndex,
    );

    const isRecordTableRowFocused = useAtomComponentFamilyStateValue(
      isRecordTableRowFocusedComponentFamilyState,
      focusIndex,
    );

    const isRecordTableRowFocusActive = useAtomComponentStateValue(
      isRecordTableRowFocusActiveComponentState,
    );

    const isRecordReadOnly = useIsRecordReadOnly({
      recordId,
      objectMetadataId: objectMetadataItem.id,
    });

    return (
      <RecordTableRowContextProvider
        value={{
          recordId: recordId,
          rowIndex: focusIndex,
          pathToShowPage:
            getBasePathToShowPage({
              objectNameSingular: objectMetadataItem.nameSingular,
            }) + recordId,
          objectNameSingular: objectMetadataItem.nameSingular,
          isSelected: isRowSelected,
          isRecordReadOnly,
        }}
      >
        <RecordTableRowDiv
          className="table-row"
          isDragging={isDragging}
          ref={ref}
          onClickCapture={handleRowClickCapture}
          data-active={isRecordTableRowActive}
          data-focused={
            isRecordTableRowFocusActive &&
            isRecordTableRowFocused &&
            !isRecordTableRowActive
          }
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...props}
        >
          {children}
        </RecordTableRowDiv>
      </RecordTableRowContextProvider>
    );
  },
);
