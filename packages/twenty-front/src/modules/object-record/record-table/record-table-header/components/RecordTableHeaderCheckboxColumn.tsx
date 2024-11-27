import styled from '@emotion/styled';

import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { allRowsSelectedStatusComponentSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { Checkbox } from 'twenty-ui';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 32px;
  justify-content: center;
  background-color: ${({ theme }) => theme.background.primary};
`;

const StyledColumnHeaderCell = styled.th`
  background-color: ${({ theme }) => theme.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-right: transparent;
  width: 30px;
`;

export const RecordTableHeaderCheckboxColumn = () => {
  const allRowsSelectedStatus = useRecoilComponentValueV2(
    allRowsSelectedStatusComponentSelector,
  );
  const { selectAllRows, resetTableRowSelection, setHasUserSelectedAllRows } =
    useRecordTable();
  const checked =
    allRowsSelectedStatus === 'all' || allRowsSelectedStatus === 'some';
  const indeterminate = allRowsSelectedStatus === 'some';

  const onChange = () => {
    if (checked) {
      setHasUserSelectedAllRows(false);
      resetTableRowSelection();
    } else {
      setHasUserSelectedAllRows(true);
      selectAllRows();
    }
  };

  return (
    <StyledColumnHeaderCell>
      <StyledContainer>
        <Checkbox
          hoverable
          checked={checked}
          onChange={onChange}
          indeterminate={indeterminate}
        />
      </StyledContainer>
    </StyledColumnHeaderCell>
  );
};
