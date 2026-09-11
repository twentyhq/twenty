import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { styled } from '@linaria/react';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { useIsDropdownOpen } from '@/ui/layout/dropdown/hooks/useIsDropdownOpen';

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
  const isDropdownOpen = useIsDropdownOpen(dropdownId);

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
              title={tooltip ?? ''}
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
