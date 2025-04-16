import { styled } from '@linaria/react';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

type TextDisplayProps = {
  text: string;
  displayedMaxRows?: number;
};

const StyledContainer = styled.div`
  height: 20px;
  display: flex;
  align-items: center;
`;

export const TextDisplay = ({ text, displayedMaxRows }: TextDisplayProps) => {
  return (
    <StyledContainer>
      <OverflowingTextWithTooltip
        text={text}
        displayedMaxRows={displayedMaxRows}
        isTooltipMultiline={true}
      />
    </StyledContainer>
  );
};
