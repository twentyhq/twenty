import styled from '@emotion/styled';

const StyledCommandTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 100vh;
  justify-content: center;
`;

const StyledCommandText = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  white-space: nowrap;
`;

const StyledCommandKeys = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: 0px 0px 1px ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  flex-direction: column;
  height: ${({ theme }) => theme.spacing(5)};
  justify-content: center;
  text-align: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

export type CommandItemTextProps = {
  firstKey?: string;
  joinKey?: string;
  secondKey?: string;
};

export const CommandItemText = ({
  firstKey,
  secondKey,
  joinKey = 'then',
}: CommandItemTextProps) => {
  return (
    <StyledCommandText>
      <StyledCommandTextContainer>
        <StyledCommandKeys>{firstKey}</StyledCommandKeys>
        {joinKey}
        <StyledCommandKeys>{secondKey}</StyledCommandKeys>
      </StyledCommandTextContainer>
    </StyledCommandText>
  );
};
