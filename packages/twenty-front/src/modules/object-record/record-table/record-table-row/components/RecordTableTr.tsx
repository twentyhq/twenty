import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { isRowVisibleComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowVisibleComponentFamilyState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
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
  const currentRowSelected = useRecoilComponentFamilyValueV2(
    isRowSelectedComponentFamilyState,
    recordId,
  );

  const isRowVisible = useRecoilComponentFamilyValueV2(
    isRowVisibleComponentFamilyState,
    recordId,
  );

  const isActive = useRecoilComponentFamilyValueV2(
    isRecordTableRowActiveComponentFamilyState,
    focusIndex,
  );

  const isNextRowActive = useRecoilComponentFamilyValueV2(
    isRecordTableRowActiveComponentFamilyState,
    focusIndex + 1,
  );

  const isFocused = useRecoilComponentFamilyValueV2(
    isRecordTableRowFocusedComponentFamilyState,
    focusIndex,
  );

  const isRowFocusActive = useRecoilComponentValueV2(
    isRecordTableRowFocusActiveComponentState,
  );

  const isNextRowFocused = useRecoilComponentFamilyValueV2(
    isRecordTableRowFocusedComponentFamilyState,
    focusIndex + 1,
  );

  const isNextRowActiveOrFocused =
    (isRowFocusActive && isNextRowFocused) || isNextRowActive;

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
