import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { useIsRecordDeleted } from '@/object-record/record-field/ui/hooks/useIsRecordDeleted';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowDiv } from '@/object-record/record-table/record-table-row/components/RecordTableRowDiv';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowActiveByRecordIdComponentFamilySelector } from '@/object-record/record-table/states/selectors/isRecordTableRowActiveByRecordIdComponentFamilySelector';
import { isRecordTableRowFocusedByRecordIdComponentFamilySelector } from '@/object-record/record-table/states/selectors/isRecordTableRowFocusedByRecordIdComponentFamilySelector';
import { useRecordRestrictedFieldNames } from '@/object-record/record-store/hooks/useRecordRestrictedFieldNames';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';

import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { forwardRef, useMemo, type ReactNode } from 'react';

type RecordTableTrProps = {
  children: ReactNode;
  recordId: string;
  isDragging?: boolean;
} & Omit<
  React.ComponentProps<typeof RecordTableRowDiv>,
  'isActive' | 'isNextRowActiveOrFocused' | 'isFocused'
>;

export const RecordTableTr = forwardRef<HTMLDivElement, RecordTableTrProps>(
  ({ children, recordId, isDragging = false, ...props }, ref) => {
    const { objectMetadataItem, isObjectReadOnly } =
      useRecordTableContextOrThrow();

    const isRecordSelected = useAtomComponentFamilyStateValue(
      isRecordSelectedComponentFamilyState,
      recordId,
    );

    const isRecordTableRowActive = useAtomComponentFamilySelectorValue(
      isRecordTableRowActiveByRecordIdComponentFamilySelector,
      recordId,
    );

    const isRecordTableRowFocused = useAtomComponentFamilySelectorValue(
      isRecordTableRowFocusedByRecordIdComponentFamilySelector,
      recordId,
    );

    const isRecordTableRowFocusActive = useAtomComponentStateValue(
      isRecordTableRowFocusActiveComponentState,
    );

    const isRecordDeleted = useIsRecordDeleted({ recordId });

    const restrictedFieldNames = useRecordRestrictedFieldNames(recordId);

    const recordTableRowContextValue = useMemo(
      () => ({
        recordId,
        pathToShowPage:
          getBasePathToShowPage({
            objectNameSingular: objectMetadataItem.nameSingular,
          }) + recordId,
        objectNameSingular: objectMetadataItem.nameSingular,
        isSelected: isRecordSelected,
        isRecordReadOnly: isObjectReadOnly || isRecordDeleted,
        restrictedFieldNames,
      }),
      [
        restrictedFieldNames,
        isObjectReadOnly,
        isRecordDeleted,
        isRecordSelected,
        objectMetadataItem.nameSingular,
        recordId,
      ],
    );

    return (
      <RecordTableRowContextProvider value={recordTableRowContextValue}>
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
