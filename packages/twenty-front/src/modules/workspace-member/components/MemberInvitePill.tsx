/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconPointFilled } from '@tabler/icons-react';

const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  margin-right: ${({ theme }) => theme.spacing(2)};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const StyledControlContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: not-allowed;
  display: flex;
  justify-content: space-between;
  padding: 5.5px ${({ theme }) => theme.spacing(2)};
`;

const StyledControlLabel = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const MemberInvitePill = () => {
  const theme = useTheme();
  return (
    <StyledContainer>
      <StyledControlContainer>
        <StyledControlLabel>
          <IconPointFilled
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.sm}
          />
          Invite Sent
        </StyledControlLabel>
      </StyledControlContainer>
    </StyledContainer>
  );
};
