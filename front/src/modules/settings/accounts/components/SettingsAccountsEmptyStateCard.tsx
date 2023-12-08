import { useCallback } from 'react';
import styled from '@emotion/styled';

import { IconGoogle } from '@/ui/display/icon/components/IconGoogle';
import { Button } from '@/ui/input/button/components/Button';
import { Card } from '@/ui/layout/card/components/Card';
import { REACT_APP_SERVER_AUTH_URL } from '~/config';
import { useGenerateTransientTokenMutation } from '~/generated/graphql';

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

export const SettingsAccountsEmptyStateCard = () => {
  const [generateTransientToken] = useGenerateTransientTokenMutation();

  const handleGmailLogin = useCallback(async () => {
    const authServerUrl = REACT_APP_SERVER_AUTH_URL;

    const transientToken = await generateTransientToken();

    const token =
      transientToken.data?.generateTransientToken.transientToken.token;

    window.location.href = `${authServerUrl}/google-gmail?transientToken=${token}`;
  }, [generateTransientToken]);
  return (
    <StyledCard>
      <StyledHeader>No connected account</StyledHeader>
      <StyledBody>
        <Button
          Icon={IconGoogle}
          title="Connect with Google"
          variant="secondary"
          onClick={handleGmailLogin}
        />
      </StyledBody>
    </StyledCard>
  );
};
