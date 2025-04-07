import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { isRowVisibleComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowVisibleComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import styled from '@emotion/styled';
import { ReactNode } from 'react';

const StyledTr = styled.tr<{ isDragging: boolean }>`
  position: relative;
  border: ${({ isDragging, theme }) =>
    isDragging
      ? `1px solid ${theme.border.color.medium}`
      : '1px solid transparent'};
  transition: border-left-color 0.2s ease-in-out;
`;

type RecordTableTrProps = {
  children: ReactNode;
  recordId: string;
  focusIndex: number;
  isDragging?: boolean;
} & React.ComponentProps<typeof StyledTr>;

export const RecordTableTr = ({
  children,
  recordId,
  focusIndex,
  isDragging = false,
}: RecordTableTrProps) => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const currentRowSelected = useRecoilComponentFamilyValueV2(
    isRowSelectedComponentFamilyState,
    recordId,
  );

  const isRowVisible = useRecoilComponentFamilyValueV2(
    isRowVisibleComponentFamilyState,
    recordId,
  );

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
        isPendingRow: false,
        inView: isRowVisible,
      }}
    >
      <StyledTr data-virtualized-id={recordId} isDragging={isDragging}>
        {children}
      </StyledTr>
    </RecordTableRowContextProvider>
  );
};
