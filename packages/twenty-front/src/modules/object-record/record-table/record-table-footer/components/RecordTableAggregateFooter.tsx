import styled from '@emotion/styled';

import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableAggregateFooterCell } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooterCell';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';

const StyledPlaceholderFirstCell = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  width: 48px;
  position: sticky;
  left: 0px;
  bottom: 0;
  z-index: ${TABLE_Z_INDEX.footer.stickyColumn};
`;

export const RecordTableAggregateFooter = ({
  currentRecordGroupId,
}: {
  currentRecordGroupId?: string;
}) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  return (
    <>
      <StyledPlaceholderFirstCell />
      {visibleRecordFields.map((recordField, index) => {
        return (
          <RecordTableColumnAggregateFooterCellContext.Provider
            key={`${recordField.fieldMetadataItemId}${currentRecordGroupId ? '-' + currentRecordGroupId : ''}`}
            value={{
              viewFieldId: recordField.id || '',
              fieldMetadataId: recordField.fieldMetadataItemId,
            }}
          >
            <RecordTableAggregateFooterCell
              currentRecordGroupId={currentRecordGroupId}
              isFirstCell={index === 0}
            />
          </RecordTableColumnAggregateFooterCellContext.Provider>
        );
      })}
      {/* TODO: fix span for divs styling here  colSpan={visibleRecordFields.length - 1}*/}
      <div />
      <div />
      <div />
    </>
  );
};
