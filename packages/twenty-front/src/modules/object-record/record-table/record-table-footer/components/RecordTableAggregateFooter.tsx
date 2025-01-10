import styled from '@emotion/styled';

import { RecordTableAggregateFooterCell } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooterCell';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

const StyledTh = styled.th`
  background-color: ${({ theme }) => theme.background.primary};
`;

export const RecordTableAggregateFooter = ({
  currentRecordGroupId,
}: {
  currentRecordGroupId?: string;
}) => {
  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
  );

  return (
    <tr>
      <StyledTh />
      <StyledTh />
      {visibleTableColumns.map((column, index) => (
        <RecordTableColumnAggregateFooterCellContext.Provider
          key={`${column.fieldMetadataId}${currentRecordGroupId ? '-' + currentRecordGroupId : ''}`}
          value={{
            viewFieldId: column.viewFieldId || '',
            fieldMetadataId: column.fieldMetadataId,
          }}
        >
          <RecordTableAggregateFooterCell
            currentRecordGroupId={currentRecordGroupId}
            isFirstCell={index === 0}
          />
        </RecordTableColumnAggregateFooterCellContext.Provider>
      ))}
    </tr>
  );
};
