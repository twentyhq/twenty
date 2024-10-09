import { AdvancedFilterViewFilter } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilter';
import { AdvancedFilterViewFilterGroup } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterGroup';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import styled from '@emotion/styled';
import { IconDotsVertical } from 'twenty-ui';
import { capitalize } from '~/utils/string/capitalize';

const StyledRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type AdvancedFilterRowProps = {
  index: number;
  logicalOperator: ViewFilterGroupLogicalOperator;
  viewBarInstanceId: string;
} & (
  | { viewFilter: ViewFilter; viewFilterGroupId?: never }
  | { viewFilter?: never; viewFilterGroupId: string }
);

// TODO: make this component a wrapper?
export const AdvancedFilterRow = (props: AdvancedFilterRowProps) => {
  return (
    <StyledRow>
      {props.index === 0
        ? 'Where'
        : props.index === 1
          ? 'Logical operator dropdown'
          : capitalize(props.logicalOperator.toLowerCase())}
      {props.viewFilter ? (
        <AdvancedFilterViewFilter viewFilter={props.viewFilter} />
      ) : (
        <AdvancedFilterViewFilterGroup
          viewBarInstanceId={props.viewBarInstanceId}
          parentViewFilterGroupId={props.viewFilterGroupId}
        />
      )}
      <IconButton Icon={IconDotsVertical} />
    </StyledRow>
  );
};
