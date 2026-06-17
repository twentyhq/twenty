import { styled } from '@linaria/react';
import { AppTooltip, Status } from 'twenty-ui/display';
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
      <div id={tooltipId}>
        <Status color={color} text={text} />
      </div>
      <AppTooltip
        anchorSelect={`#${tooltipId}`}
        content={tooltipContent}
        place="top"
      />
    </StyledContainer>
  );
};
