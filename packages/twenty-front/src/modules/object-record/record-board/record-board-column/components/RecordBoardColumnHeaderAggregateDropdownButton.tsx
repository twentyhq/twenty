import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import styled from '@emotion/styled';
import { AppTooltip, Tag, TooltipDelay } from 'twenty-ui';

const StyledButton = styled.div`
  overflow: hidden;
  padding: 0;
`;

const StyledTag = styled(Tag)`
  width: 100%;
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
  const { isDropdownOpen } = useDropdown(dropdownId);
  return (
    <StyledButton>
      <StyledTag
        text={value ? value.toString() : '-'}
        color={'transparent'}
        weight={'regular'}
      />
      {!isDropdownOpen && (
        <AppTooltip
          anchorSelect={`#${dropdownId}`}
          content={tooltip}
          noArrow
          place="right"
          positionStrategy="fixed"
          delay={TooltipDelay.mediumDelay}
        />
      )}
    </StyledButton>
  );
};
