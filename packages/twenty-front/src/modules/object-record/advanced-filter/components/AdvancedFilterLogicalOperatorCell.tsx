import { AdvancedFilterLogicalOperatorDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorDropdown';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import styled from '@emotion/styled';
import { capitalize } from '~/utils/string/capitalize';

const StyledText = styled.div`
  height: ${({ theme }) => theme.spacing(8)};
  display: flex;
  align-items: center;
`;

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  min-width: ${({ theme }) => theme.spacing(20)};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

type AdvancedFilterLogicalOperatorCellProps = {
  index: number;
  viewFilterGroup: ViewFilterGroup;
};

export const AdvancedFilterLogicalOperatorCell = ({
  index,
  viewFilterGroup,
}: AdvancedFilterLogicalOperatorCellProps) => (
  <StyledContainer>
    {index === 0 ? (
      <StyledText>Where</StyledText>
    ) : index === 1 ? (
      <AdvancedFilterLogicalOperatorDropdown
        viewFilterGroup={viewFilterGroup}
      />
    ) : (
      <StyledText>
        {capitalize(viewFilterGroup.logicalOperator.toLowerCase())}
      </StyledText>
    )}
  </StyledContainer>
);
