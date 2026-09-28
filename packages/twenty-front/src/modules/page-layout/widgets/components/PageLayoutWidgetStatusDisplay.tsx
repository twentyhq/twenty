import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { Status } from 'twenty-ui/primitives/data-display';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { type ThemeColor } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

type PageLayoutWidgetStatusDisplayProps = {
  tooltipId: string;
  text: string;
  tooltipContent: string;
  color?: ThemeColor;
};

export const PageLayoutWidgetStatusDisplay = ({
  tooltipId,
  text,
  tooltipContent,
  color = 'red',
}: PageLayoutWidgetStatusDisplayProps) => {
  return (
    <StyledContainer>
      <Tooltip
        delay={TooltipDelay.mediumDelay}
        content={tooltipContent}
        side="top"
      >
        <div id={tooltipId}>
          <Status color={color}>{text}</Status>
        </div>
      </Tooltip>
    </StyledContainer>
  );
};
