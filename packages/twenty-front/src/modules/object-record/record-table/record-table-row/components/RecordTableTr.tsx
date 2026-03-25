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
    const { objectMetadataItem } = useRecordTableContextOrThrow();

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
