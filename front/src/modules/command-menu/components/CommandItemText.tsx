import styled from '@emotion/styled';

export type CommandItemTextProps = {
  text: string;
};

const StyledCommandTextContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
`;

const StyledCommandText = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  white-space: nowrap;
`;

const StyledCommandKeys = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: 0px 0px 1px ${({ theme }) => theme.boxShadow.strong};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

export const CommandItemText = ({ text }: CommandItemTextProps) => {
  const thenIndex = text.indexOf('then');
  if (thenIndex !== -1) {
    const keyBefore = text.charAt(0);
    const keyAfter = text.charAt(text.length - 1);
    return (
      <StyledCommandText>
        <StyledCommandTextContainer>
          <StyledCommandKeys>{keyBefore}</StyledCommandKeys>
          then
          <StyledCommandKeys>{keyAfter}</StyledCommandKeys>
        </StyledCommandTextContainer>
      </StyledCommandText>
    );
  }
  return <StyledCommandText>{text}</StyledCommandText>;
};
