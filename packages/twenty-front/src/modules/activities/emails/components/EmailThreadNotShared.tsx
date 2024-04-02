import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconLock } from 'twenty-ui';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 0;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 20px;
  padding: ${({ theme }) => theme.spacing(0, 1)};

  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  background: ${({ theme }) => theme.background.transparent.lighter};

  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

export const EmailThreadNotShared = () => {
  const theme = useTheme();
  return (
    <StyledContainer>
      <IconLock size={theme.icon.size.md} />
      Not shared
    </StyledContainer>
  );
};
