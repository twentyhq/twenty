import { AdvancedFilterLogicalOperatorDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorDropdown';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import styled from '@emotion/styled';
import { capitalize } from '~/utils/string/capitalize';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  min-width: ${({ theme }) => theme.spacing(22)};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

interface AdvancedFilterLogicalOperatorCellProps {
  index: number;
  viewFilterGroup: ViewFilterGroup;
}

export const AdvancedFilterLogicalOperatorCell = (
  props: AdvancedFilterLogicalOperatorCellProps,
) => (
  <StyledContainer>
    {props.index === 0 ? (
      'Where'
    ) : props.index === 1 ? (
      <AdvancedFilterLogicalOperatorDropdown
        viewFilterGroup={props.viewFilterGroup}
      />
    ) : (
      capitalize(props.viewFilterGroup.logicalOperator.toLowerCase())
    )}
  </StyledContainer>
);
