import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { useIsRecordDeleted } from '@/object-record/record-field/ui/hooks/useIsRecordDeleted';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowDiv } from '@/object-record/record-table/record-table-row/components/RecordTableRowDiv';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';

import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { forwardRef, type ReactNode } from 'react';

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
    const { objectMetadataItem, isObjectReadOnly } =
      useRecordTableContextOrThrow();

    const isRecordSelected = useAtomComponentFamilyStateValue(
      isRecordSelectedComponentFamilyState,
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

    const isRecordDeleted = useIsRecordDeleted({ recordId });

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
          isSelected: isRecordSelected,
          isRecordReadOnly: isObjectReadOnly || isRecordDeleted,
        }}
      >
        <RecordTableRowDiv
          className="table-row"
          isDragging={isDragging}
          ref={ref}
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
