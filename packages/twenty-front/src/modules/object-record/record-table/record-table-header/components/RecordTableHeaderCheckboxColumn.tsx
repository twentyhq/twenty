import styled from '@emotion/styled';

import { useCurrentRecordGroup } from '@/object-record/record-group/hooks/useCurrentRecordGroup';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { allRowsSelectedStatusComponentSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusComponentSelector';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
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
  max-width: 30px;
  min-width: 30px;
  width: 30px;
`;

export const RecordTableHeaderCheckboxColumn = () => {
  const recordGroup = useCurrentRecordGroup();

  const allRowsSelectedStatus = useRecoilComponentFamilyValueV2(
    allRowsSelectedStatusComponentSelector,
    recordGroup.id,
  );
  const { selectAllRows, resetTableRowSelection, setHasUserSelectedAllRows } =
    useRecordTable();

  const checked = allRowsSelectedStatus === 'all';
  const indeterminate = allRowsSelectedStatus === 'some';

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setHasUserSelectedAllRows(true);
      selectAllRows();
    } else {
      resetTableRowSelection();
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
