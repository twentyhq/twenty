import styled from '@emotion/styled';

const StyledCommandTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
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

const StyledCommandKey = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.underline};
  display: flex;
  flex-direction: column;

  height: ${({ theme }) => theme.spacing(5)};
  height: 18px;
  justify-content: center;
  text-align: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

export type MenuItemCommandHotKeysProps = {
  firstHotKey?: string;
  joinLabel?: string;
  secondHotKey?: string;
};

export const MenuItemCommandHotKeys = ({
  firstHotKey,
  secondHotKey,
  joinLabel = 'then',
}: MenuItemCommandHotKeysProps) => {
  return (
    <StyledCommandText>
      {firstHotKey && (
        <StyledCommandTextContainer>
          <StyledCommandKey>{firstHotKey}</StyledCommandKey>
          {secondHotKey && (
            <>
              {joinLabel}
              <StyledCommandKey>{secondHotKey}</StyledCommandKey>
            </>
          )}
        </StyledCommandTextContainer>
      )}
    </StyledCommandText>
  );
};
