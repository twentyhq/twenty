import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconLock } from 'twenty-ui/display';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 0;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 20px;
  width: 100%;
  min-width: ${({ theme }) =>
    `calc(${theme.icon.size.md} + ${theme.spacing(2)})`};
  padding: ${({ theme }) => theme.spacing(0, 1)};

  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  background: ${({ theme }) => theme.background.transparent.lighter};

  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const StyledText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const EmailThreadNotShared = () => {
  const theme = useTheme();
  return (
    <StyledContainer>
      <IconLock size={theme.icon.size.md} />
      <StyledText>Not shared</StyledText>
    </StyledContainer>
  );
};
