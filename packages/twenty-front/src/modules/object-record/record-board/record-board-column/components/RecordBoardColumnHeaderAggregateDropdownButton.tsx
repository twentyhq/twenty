import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { type Nullable } from 'twenty-shared/types';
import { Tag } from 'twenty-ui/components';
import { AppTooltip, TooltipDelay } from 'twenty-ui/display';

const StyledTag = styled(Tag)`
  width: 100%;
`;

const StyledHeader = styled(StyledHeaderDropdownButton)`
  padding: 0;
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
  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  return (
    <StyledHeader id={dropdownId} isUnfolded={isDropdownOpen}>
      <>
        <StyledTag
          text={value ? value.toString() : '-'}
          color="transparent"
          weight="regular"
        />
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
    </StyledHeader>
  );
};
