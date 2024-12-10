import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import styled from '@emotion/styled';
import { AppTooltip, Tag, TooltipDelay } from 'twenty-ui';
import { formatNumber } from '~/utils/format/number';

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
        <Tag
          text={value ? formatNumber(Number(value)) : '-'}
          color={'transparent'}
        />
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
