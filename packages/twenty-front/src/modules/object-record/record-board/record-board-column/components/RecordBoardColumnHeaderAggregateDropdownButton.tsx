import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import { AppTooltip, TooltipDelay } from 'twenty-ui/display';

const StyledTagContainer = styled.div`
  width: 100%;
`;

const StyledHeaderContainer = styled.div`
  > * {
    padding: 0;
  }
`;

export const RecordBoardColumnHeaderAggregateDropdownButton = ({
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
      <StyledHeaderDropdownButton id={dropdownId} isUnfolded={isDropdownOpen}>
        <>
          <StyledTagContainer>
            <Tag
              text={isDefined(value) ? value.toString() : '-'}
              color="transparent"
              weight="regular"
            />
          </StyledTagContainer>
          {!isDropdownOpen && (
            <AppTooltip
              anchorSelect={`#${dropdownId}`}
              content={tooltip ?? ''}
              noArrow
              place="right"
              positionStrategy="fixed"
              delay={TooltipDelay.mediumDelay}
            />
          )}
        </>
      </StyledHeaderDropdownButton>
    </StyledHeaderContainer>
  );
};
