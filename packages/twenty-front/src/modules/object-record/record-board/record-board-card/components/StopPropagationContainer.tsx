import { isClickOnRecordBoardCardFieldBackground } from '@/object-record/record-board/record-board-card/utils/isClickOnRecordBoardCardFieldBackground';
import { styled } from '@linaria/react';
import { type MouseEvent, type ReactNode } from 'react';

const StyledFieldContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

type StopPropagationContainerProps = {
  children: ReactNode;
  shouldLetBackgroundClicksThrough?: boolean;
};

export const StopPropagationContainer = ({
  children,
  shouldLetBackgroundClicksThrough = false,
}: StopPropagationContainerProps) => {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (
      shouldLetBackgroundClicksThrough &&
      isClickOnRecordBoardCardFieldBackground(event)
    ) {
      return;
    }

    event.stopPropagation();
  };

  return (
    <StyledFieldContainer onClick={handleClick}>
      {children}
    </StyledFieldContainer>
  );
};
