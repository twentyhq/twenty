import React from 'react';
import styled from '@emotion/styled';

import { useSelectAllRows } from '@/ui/tables/hooks/useSelectAllRows';

import { Checkbox } from '../form/CheckboxV2';

const StyledContainer = styled.div`
  align-items: center;

  cursor: pointer;
  display: flex;
  height: 32px;

  justify-content: center;
`;

export const SelectAllCheckbox = () => {
  const { selectAllRows, allRowsSelectedStatus } = useSelectAllRows();

  function handleContainerClick() {
    selectAllRows();
  }

  const checked = allRowsSelectedStatus === 'all';
  const indeterminate = allRowsSelectedStatus === 'some';

  return (
    <StyledContainer
      onClick={handleContainerClick}
      data-testid="input-checkbox-cell-container"
    >
      <Checkbox checked={checked} indeterminate={indeterminate} />
    </StyledContainer>
  );
};
