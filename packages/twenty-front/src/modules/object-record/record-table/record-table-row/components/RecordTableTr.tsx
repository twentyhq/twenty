import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { isRowVisibleComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowVisibleComponentFamilyState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import styled from '@emotion/styled';
import { ReactNode, forwardRef } from 'react';

const StyledTr = styled.tr<{
  isDragging: boolean;
  isActive: boolean;
  isFocused: boolean;
  isNextRowActiveOrFocused: boolean;
}>`
  border: ${({ isDragging, theme }) =>
    isDragging
      ? `1px solid ${theme.border.color.medium}`
      : '1px solid transparent'};
  position: relative;
  transition: border-left-color 0.2s ease-in-out;

  ${({ isNextRowActiveOrFocused }) =>
    isNextRowActiveOrFocused
      ? `
      td { 
          border-bottom: none;
      }
      `
      : ''}

  ${({ isActive, isFocused, theme }) =>
    isActive
      ? `
      td {
        &:not(:first-of-type) {
          border-bottom: 1px solid ${theme.adaptiveColors.blue3};
          border-top: 1px solid ${theme.adaptiveColors.blue3};
          background-color: ${theme.accent.quaternary};
        }
        &:nth-of-type(2) {
          border-left: 1px solid ${theme.adaptiveColors.blue3};
          border-radius: ${theme.border.radius.sm} 0 0 ${theme.border.radius.sm};
        }
        &:last-of-type {
          border-right: 1px solid ${theme.adaptiveColors.blue3};
          border-radius: 0 ${theme.border.radius.sm} ${theme.border.radius.sm} 0;
        }
      }
    `
      : isFocused
        ? `
      td {
        &:not(:first-of-type) {
          border-bottom: 1px solid ${theme.border.color.medium};
          border-top: 1px solid ${theme.border.color.medium};
          background-color: ${theme.background.tertiary};
        }
        &:nth-of-type(2) {
          border-left: 1px solid ${theme.border.color.medium};
          border-radius: ${theme.border.radius.sm} 0 0 ${theme.border.radius.sm};
        }
        &:last-of-type {
          border-right: 1px solid ${theme.border.color.medium};
          border-radius: 0 ${theme.border.radius.sm} ${theme.border.radius.sm} 0;
        }
      }
    `
        : ''}
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

  const isNextRowFocused = useRecoilComponentFamilyValueV2(
    isRecordTableRowFocusedComponentFamilyState,
    focusIndex + 1,
  );

  const isNextRowActiveOrFocused = isNextRowActive || isNextRowFocused;

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
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        isActive={isActive}
        isFocused={isFocused}
        isNextRowActiveOrFocused={isNextRowActiveOrFocused}
      >
        {children}
      </StyledTr>
    </RecordTableRowContextProvider>
  );
});
