import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

const StyledTagContainer = styled.div`
  width: 100%;
`;

const StyledHeaderContainer = styled.div`
  > * {
    padding: 0;
  }
`;

export const RecordGroupAggregateDropdownButton = ({
  dropdownId,
  value,
  tooltip,
}: {
  dropdownId: string;
  value?: Nullable<string | number>;
  tooltip?: Nullable<string>;
}) => {
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  return (
    <StyledHeaderContainer>
      <Tooltip
        content={tooltip ?? ''}
        side="right"
        positionMethod="fixed"
        delay={TooltipDelay.mediumDelay}
        disabled={isDropdownOpen}
      >
        <StyledHeaderDropdownButton id={dropdownId} isUnfolded={isDropdownOpen}>
          <StyledTagContainer>
            <Tag color="transparent" weight="regular">
              {isDefined(value) ? value.toString() : '-'}
            </Tag>
          </StyledTagContainer>
        </StyledHeaderDropdownButton>
      </Tooltip>
    </StyledHeaderContainer>
  );
};
