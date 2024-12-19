import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import styled from '@emotion/styled';
import { AppTooltip, Tag, TooltipDelay } from 'twenty-ui';

const StyledButton = styled(StyledHeaderDropdownButton)`
  padding: 0;
`;

export const RecordBoardColumnHeaderAggregateDropdownButton = ({
  dropdownId,
  value,
  tooltip,
}: {
  dropdownId: string;
  value?: string | number;
  tooltip?: string;
}) => {
  return (
    <div id={dropdownId}>
      <StyledButton>
        <Tag text={value ? value.toString() : '-'} color={'transparent'} />
        <AppTooltip
          anchorSelect={`#${dropdownId}`}
          content={tooltip}
          noArrow
          place="right"
          positionStrategy="fixed"
          delay={TooltipDelay.shortDelay}
        />
      </StyledButton>
    </div>
  );
};
