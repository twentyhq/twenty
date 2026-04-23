import { styled } from '@linaria/react';
import { isUndefined } from '@sniptt/guards';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

type TextDisplayProps = {
  text: string;
  displayedMaxRows?: number;
};

const StyledContainer = styled.div<{ fixHeight: boolean }>`
  align-items: center;
  display: flex;
  height: ${({ fixHeight }) => (fixHeight ? '20px' : 'auto')};
`;

export const TextDisplay = ({ text, displayedMaxRows }: TextDisplayProps) => {
  return (
    <StyledContainer
      fixHeight={isUndefined(displayedMaxRows) || displayedMaxRows === 1}
    >
      <OverflowingTextWithTooltip
        text={text}
        displayedMaxRows={displayedMaxRows}
        isTooltipMultiline={true}
      />
    </StyledContainer>
  );
};
