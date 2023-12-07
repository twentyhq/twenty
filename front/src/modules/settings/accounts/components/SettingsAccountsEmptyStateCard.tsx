import styled from '@emotion/styled';

import { IconGoogle } from '@/ui/display/icon/components/IconGoogle';
import { Button } from '@/ui/input/button/components/Button';
import { Card } from '@/ui/layout/card/components/Card';

const StyledCard = styled(Card)`
  border-radius: ${({ theme }) => theme.border.radius.md};
  overflow: hidden;
  padding: 0;
`;

const StyledHeader = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(2, 4)};
`;

const StyledBody = styled.div`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsAccountsEmptyStateCard = () => (
  <StyledCard>
    <StyledHeader>No connected account</StyledHeader>
    <StyledBody>
      <Button
        Icon={IconGoogle}
        title="Connect with Google"
        variant="secondary"
      />
    </StyledBody>
  </StyledCard>
);
