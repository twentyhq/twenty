import { useCallback } from 'react';
import styled from '@emotion/styled';
import { Button, Card, CardContent, CardHeader, IconGoogle } from 'twenty-ui';

import { useGenerateTransientTokenMutation } from '~/generated/graphql';

const StyledHeader = styled(CardHeader)`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(6)};
`;

const StyledBody = styled(CardContent)`
  display: flex;
  justify-content: center;
`;

type SettingsAccountsListEmptyStateCardProps = {
  label?: string;
};

export const SettingsAccountsListEmptyStateCard = ({
  label,
}: SettingsAccountsListEmptyStateCardProps) => {
  const [generateTransientToken] = useGenerateTransientTokenMutation();

  const handleGmailLogin = useCallback(async () => {
    const authServerUrl = REACT_APP_SERVER_BASE_URL;

    const transientToken = await generateTransientToken();

    const token =
      transientToken.data?.generateTransientToken.transientToken.token;

    window.location.href = `${authServerUrl}/auth/google-gmail?transientToken=${token}`;
  }, [generateTransientToken]);

  return (
    <Card>
      <StyledHeader>{label || 'No connected account'}</StyledHeader>
      <StyledBody>
        <Button
          Icon={IconGoogle}
          title="Connect with Google"
          variant="secondary"
          onClick={handleGmailLogin}
        />
      </StyledBody>
    </Card>
  );
};
