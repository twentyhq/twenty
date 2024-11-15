import styled from '@emotion/styled';

import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { allRowsSelectedStatusComponentSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { Checkbox, MOBILE_VIEWPORT } from 'twenty-ui';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 32px;
  justify-content: center;
  background-color: ${({ theme }) => theme.background.primary};
`;

const StyledColumnHeaderCell = styled.th<{ setNumColumns: number }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-right: transparent;
  text-align: center;
  width: ${({ setNumColumns }) => {
    return setNumColumns <= 6 ? '22px' : '32px';
  }};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 32px;
  }
`;

export const RecordTableHeaderCheckboxColumn = () => {
  const allRowsSelectedStatus = useRecoilComponentValueV2(
    allRowsSelectedStatusComponentSelector,
  );
  const {
    selectAllRows,
    resetTableRowSelection,
    setHasUserSelectedAllRows,
    setNumColumns,
  } = useRecordTable();
  const checked = allRowsSelectedStatus === 'all';
  const indeterminate = allRowsSelectedStatus === 'some';

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setHasUserSelectedAllRows(true);
      selectAllRows();
    } else {
      setHasUserSelectedAllRows(false);
      resetTableRowSelection();
    }
  };

  return (
    <StyledColumnHeaderCell setNumColumns={setNumColumns}>
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
