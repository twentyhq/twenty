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
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
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

    const currentRowSelected = useRecoilComponentFamilyValue(
      isRowSelectedComponentFamilyState,
      recordId,
    );

    const isActive = useRecoilComponentFamilyValue(
      isRecordTableRowActiveComponentFamilyState,
      focusIndex,
    );

    const isNextRowActive = useRecoilComponentFamilyValue(
      isRecordTableRowActiveComponentFamilyState,
      focusIndex + 1,
    );

    const nextRecordId = useRecoilComponentFamilyValue(
      recordIdByRealIndexComponentFamilyState,
      { realIndex: focusIndex + 1 },
    );

    const isNextRecordIdFirstOfGroup = useRecoilComponentFamilyValue(
      isRecordIdFirstOfGroupComponentFamilySelector,
      { recordId: nextRecordId ?? '' },
    );

    const isFocused = useRecoilComponentFamilyValue(
      isRecordTableRowFocusedComponentFamilyState,
      focusIndex,
    );

    const isRowFocusActive = useRecoilComponentValue(
      isRecordTableRowFocusActiveComponentState,
    );

    const isNextRowFocused = useRecoilComponentFamilyValue(
      isRecordTableRowFocusedComponentFamilyState,
      focusIndex + 1,
    );

    const isNextRowActiveOrFocused =
      !isNextRecordIdFirstOfGroup &&
      ((isRowFocusActive && isNextRowFocused) || isNextRowActive);

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
          isSelected: currentRowSelected,
          isRecordReadOnly,
        }}
      >
        {isFirstRowOfGroup ? (
          <RecordTableFirstRowOfGroup
            className="table-row"
            data-virtualized-id={recordId}
            isDragging={isDragging}
            ref={ref}
            data-active={isActive}
            data-focused={isRowFocusActive && isFocused && !isActive}
            data-next-row-active-or-focused={isNextRowActiveOrFocused}
            isNextRowActiveOrFocused={isNextRowActiveOrFocused}
            focusIndex={focusIndex}
            isFocused={isFocused}
            isRowFocusActive={isRowFocusActive}
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
            data-active={isActive}
            data-focused={isRowFocusActive && isFocused && !isActive}
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
