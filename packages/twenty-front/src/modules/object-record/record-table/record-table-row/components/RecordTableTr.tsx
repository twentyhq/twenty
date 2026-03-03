import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableFirstRowOfGroup } from '@/object-record/record-table/record-table-row/components/RecordTableFirstRowOfGroup';
import { RecordTableRowDiv } from '@/object-record/record-table/record-table-row/components/RecordTableRowDiv';
import { isRecordIdFirstOfGroupComponentFamilySelector } from '@/object-record/record-table/record-table-row/states/isRecordIdFirstOfGroupComponentFamilySelector';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { recordIdByRealIndexComponentFamilySelector } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilySelector';

import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { forwardRef, type ReactNode } from 'react';
type RecordTableTrProps = {
  children: ReactNode;
  recordId: string;
  focusIndex: number;
  isDragging?: boolean;
  isFirstRowOfGroup?: boolean;
} & Omit<
  React.ComponentProps<typeof RecordTableRowDiv>,
  'isActive' | 'isNextRowActiveOrFocused' | 'isFocused'
>;

export const RecordTableTr = forwardRef<HTMLDivElement, RecordTableTrProps>(
  (
    {
      children,
      recordId,
      focusIndex,
      isDragging = false,
      isFirstRowOfGroup,
      ...props
    },
    ref,
  ) => {
    const { objectMetadataItem } = useRecordTableContextOrThrow();

    const isRowSelected = useAtomComponentFamilyStateValue(
      isRowSelectedComponentFamilyState,
      recordId,
    );

    const isRecordTableRowActive = useAtomComponentFamilyStateValue(
      isRecordTableRowActiveComponentFamilyState,
      focusIndex,
    );

    // eslint-disable-next-line twenty/matching-state-variable
    const isNextRecordTableRowActive = useAtomComponentFamilyStateValue(
      isRecordTableRowActiveComponentFamilyState,
      focusIndex + 1,
    );

    const nextRecordId = useAtomComponentFamilySelectorValue(
      recordIdByRealIndexComponentFamilySelector,
      focusIndex + 1,
    );

    const isNextRecordIdFirstOfGroup = useAtomComponentFamilySelectorValue(
      isRecordIdFirstOfGroupComponentFamilySelector,
      nextRecordId ?? '',
    );

    const isRecordTableRowFocused = useAtomComponentFamilyStateValue(
      isRecordTableRowFocusedComponentFamilyState,
      focusIndex,
    );

    const isRecordTableRowFocusActive = useAtomComponentStateValue(
      isRecordTableRowFocusActiveComponentState,
    );

    // eslint-disable-next-line twenty/matching-state-variable
    const isNextRecordTableRowFocused = useAtomComponentFamilyStateValue(
      isRecordTableRowFocusedComponentFamilyState,
      focusIndex + 1,
    );

    const isNextRowActiveOrFocused =
      !isNextRecordIdFirstOfGroup &&
      ((isRecordTableRowFocusActive && isNextRecordTableRowFocused) ||
        isNextRecordTableRowActive);

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
        {isFirstRowOfGroup ? (
          <RecordTableFirstRowOfGroup
            className="table-row"
            data-virtualized-id={recordId}
            isDragging={isDragging}
            ref={ref}
            data-active={isRecordTableRowActive}
            data-focused={
              isRecordTableRowFocusActive &&
              isRecordTableRowFocused &&
              !isRecordTableRowActive
            }
            data-next-row-active-or-focused={isNextRowActiveOrFocused}
            isNextRowActiveOrFocused={isNextRowActiveOrFocused}
            focusIndex={focusIndex}
            isFocused={isRecordTableRowFocused}
            isRowFocusActive={isRecordTableRowFocusActive}
            recordId={recordId}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
          >
            {children}
          </RecordTableFirstRowOfGroup>
        ) : (
          <RecordTableRowDiv
            className="table-row"
            data-virtualized-id={recordId}
            isDragging={isDragging}
            ref={ref}
            data-active={isRecordTableRowActive}
            data-focused={
              isRecordTableRowFocusActive &&
              isRecordTableRowFocused &&
              !isRecordTableRowActive
            }
            data-next-row-active-or-focused={isNextRowActiveOrFocused}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
          >
            {children}
          </RecordTableRowDiv>
        )}
      </RecordTableRowContextProvider>
    );
  },
);
