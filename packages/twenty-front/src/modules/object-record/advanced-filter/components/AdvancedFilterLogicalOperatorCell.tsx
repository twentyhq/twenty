import { AdvancedFilterLogicalOperatorDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorDropdown';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';

import styled from '@emotion/styled';
import { capitalize } from 'twenty-shared/utils';

const StyledText = styled.div`
  height: ${({ theme }) => theme.spacing(8)};
  display: flex;
  align-items: center;
  padding-left: ${({ theme }) => theme.spacing(2.25)};
`;

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  min-width: ${({ theme }) => theme.spacing(20)};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const WhereLabel = styled(StyledText)`
  && {
    color: ${({ theme }) => theme.font.color.primary};
    font-weight: 600;
  }
`;

type AdvancedFilterLogicalOperatorCellProps = {
  index: number;
  recordFilterGroup: RecordFilterGroup;
};

export const AdvancedFilterLogicalOperatorCell = ({
  index,
  recordFilterGroup,
}: AdvancedFilterLogicalOperatorCellProps) => {
  return (
    <StyledContainer>
      {index === 0 ? (
        <WhereLabel>Where</WhereLabel>
      ) : index === 1 ? (
        <AdvancedFilterLogicalOperatorDropdown
          recordFilterGroup={recordFilterGroup}
        />
      ) : (
        <StyledText>
          {capitalize(recordFilterGroup.logicalOperator.toLowerCase())}
        </StyledText>
      )}
    </StyledContainer>
  );
};
