import styled from '@emotion/styled';

const StyledFilterCounter = styled.div<{
  backgroundColor: string;
  textColor: string;
}>`
  align-items: center;
  background: ${({ backgroundColor }) => backgroundColor};
  border-radius: 50%;
  color: ${({ textColor }) => textColor};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xxs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  height: 12px;
  justify-content: center;
  width: 12px;
  left: -3px;
  position: absolute;
  top: -3px;
  z-index: 1;
`;

export const WorkflowStepFilterCounter = ({
  backgroundColor,
  textColor,
  counter,
}: {
  backgroundColor: string;
  textColor: string;
  counter: number;
}) => (
  <StyledFilterCounter backgroundColor={backgroundColor} textColor={textColor}>
    {counter}
  </StyledFilterCounter>
);
