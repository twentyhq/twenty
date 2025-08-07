import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { useIsRecordReadOnly } from '@/object-record/record-field/hooks/read-only/useIsRecordReadOnly';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { isRowVisibleComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowVisibleComponentFamilyState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { ReactNode, forwardRef } from 'react';

const StyledTr = styled.tr<{
  isDragging: boolean;
}>`
  border: ${({ isDragging, theme }) =>
    isDragging
      ? `1px solid ${theme.border.color.medium}`
      : '1px solid transparent'};
  position: relative;
  transition: border-left-color 0.2s ease-in-out;

  &[data-next-row-active-or-focused='true'] {
    td {
      border-bottom: none;
    }
  }

  &[data-focused='true'] {
    td {
      &:not(:first-of-type) {
        border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
        border-top: 1px solid ${({ theme }) => theme.border.color.medium};
        border-color: ${({ theme }) => theme.border.color.medium};
        background-color: ${({ theme }) => theme.background.tertiary};
      }
      &:nth-of-type(2) {
        border-left: 1px solid ${({ theme }) => theme.border.color.medium};
        border-radius: ${({ theme }) => theme.border.radius.sm} 0 0
          ${({ theme }) => theme.border.radius.sm};
      }
      &:last-of-type {
        border-right: 1px solid ${({ theme }) => theme.border.color.medium};
        border-radius: 0 ${({ theme }) => theme.border.radius.sm}
          ${({ theme }) => theme.border.radius.sm} 0;
      }
    }
  }

  &[data-active='true'] {
    td {
      &:not(:first-of-type) {
        border-bottom: 1px solid ${({ theme }) => theme.adaptiveColors.blue3};
        border-top: 1px solid ${({ theme }) => theme.adaptiveColors.blue3};
        background-color: ${({ theme }) => theme.accent.quaternary};
      }
      &:nth-of-type(2) {
        border-left: 1px solid ${({ theme }) => theme.adaptiveColors.blue3};
        border-radius: ${({ theme }) => theme.border.radius.sm} 0 0
          ${({ theme }) => theme.border.radius.sm};
      }
      &:last-of-type {
        border-right: 1px solid ${({ theme }) => theme.adaptiveColors.blue3};
        border-radius: 0 ${({ theme }) => theme.border.radius.sm}
          ${({ theme }) => theme.border.radius.sm} 0;
      }
    }
  }
`;

type RecordTableTrProps = {
  children: ReactNode;
  recordId: string;
  focusIndex: number;
  isDragging?: boolean;
} & Omit<
  React.ComponentProps<typeof StyledTr>,
  'isActive' | 'isNextRowActiveOrFocused' | 'isFocused'
>;

export const RecordTableTr = forwardRef<
  HTMLTableRowElement,
  RecordTableTrProps
>(({ children, recordId, focusIndex, isDragging = false, ...props }, ref) => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const currentRowSelected = useRecoilComponentFamilyValue(
    isRowSelectedComponentFamilyState,
    recordId,
  );

  const isRowVisible = useRecoilComponentFamilyValue(
    isRowVisibleComponentFamilyState,
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
    (isRowFocusActive && isNextRowFocused) || isNextRowActive;

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
        inView: isRowVisible,
        isRecordReadOnly,
      }}
    >
      <StyledTr
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
      </StyledTr>
    </RecordTableRowContextProvider>
  );
});
