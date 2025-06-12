import { AdvancedFilterLogicalOperatorDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorDropdown';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';

import styled from '@emotion/styled';
import { useContext } from 'react';
import { capitalize } from 'twenty-shared/utils';

const StyledText = styled.div<{ noPadding?: boolean }>`
  height: ${({ theme }) => theme.spacing(8)};
  display: flex;
  align-items: center;

  padding-left: ${({ theme, noPadding }) =>
    noPadding ? 0 : theme.spacing(2.25)};
`;

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  min-width: ${({ theme }) => theme.spacing(20)};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

type AdvancedFilterLogicalOperatorCellProps = {
  index: number;
  recordFilterGroup: RecordFilterGroup;
};

export const AdvancedFilterLogicalOperatorCell = ({
  index,
  recordFilterGroup,
}: AdvancedFilterLogicalOperatorCellProps) => {
  const { isColumn } = useContext(AdvancedFilterContext);

  return (
    <StyledContainer>
      {index === 0 ? (
        <StyledText noPadding={isColumn}>Where</StyledText>
      ) : index === 1 ? (
        <AdvancedFilterLogicalOperatorDropdown
          recordFilterGroup={recordFilterGroup}
        />
      ) : (
        <StyledText noPadding={isColumn}>
          {capitalize(recordFilterGroup.logicalOperator.toLowerCase())}
        </StyledText>
      )}
    </StyledContainer>
  );
};
