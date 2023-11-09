import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { Checkbox } from '@/ui/input/components/Checkbox';

import { useRecordTable } from '../hooks/useRecordTable';
import { allRowsSelectedStatusSelector } from '../states/selectors/allRowsSelectedStatusSelector';

const StyledContainer = styled.div`
  align-items: center;

  display: flex;
  height: 32px;

  justify-content: center;
`;

export const SelectAllCheckbox = () => {
  const allRowsSelectedStatus = useRecoilValue(allRowsSelectedStatusSelector);
  const { selectAllRows } = useRecordTable();

  const checked = allRowsSelectedStatus === 'all';
  const indeterminate = allRowsSelectedStatus === 'some';

  const onChange = () => {
    selectAllRows();
  };

  return (
    <StyledContainer>
      <Checkbox
        checked={checked}
        onChange={onChange}
        indeterminate={indeterminate}
      />
    </StyledContainer>
  );
};
