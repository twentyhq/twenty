import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { Checkbox } from '@/ui/input/components/Checkbox';
import { useTheme } from '@emotion/react';

const StyledContainer = styled.div`
  align-items: center;

  display: flex;
  height: 32px;

  justify-content: center;
  background-color: ${({ theme }) => theme.background.primary};
`;

export const RecordTableHeaderCheckboxColumn = () => {
  const { allRowsSelectedStatusSelector } = useRecordTableStates();

  const allRowsSelectedStatus = useRecoilValue(allRowsSelectedStatusSelector());
  const { selectAllRows, resetTableRowSelection, setHasUserSelectedAllRows } =
    useRecordTable();

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

  const theme = useTheme();

  return (
    <th
      style={{
        borderBottom: `1px solid ${theme.border.color.light}`,
        borderTop: `1px solid ${theme.border.color.light}`,
        width: 30,
        minWidth: 30,
        maxWidth: 30,
        borderRight: 'transparent',
      }}
    >
      <StyledContainer>
        <Checkbox
          checked={checked}
          onChange={onChange}
          indeterminate={indeterminate}
        />
      </StyledContainer>
    </th>
  );
};
