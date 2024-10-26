import styled from '@emotion/styled';
import { Button, Card, CardContent, CardHeader, IconGoogle } from 'twenty-ui';

import { useTriggerGoogleApisOAuth } from '@/settings/accounts/hooks/useTriggerGoogleApisOAuth';

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
  const { triggerGoogleApisOAuth } = useTriggerGoogleApisOAuth();

  const handleOnClick = async () => {
    await triggerGoogleApisOAuth();
  };

  return (
    <Card>
      <StyledHeader>{label || 'No connected account'}</StyledHeader>
      <StyledBody>
        <Button
          Icon={IconGoogle}
          title="Connect with Google"
          variant="secondary"
          onClick={handleOnClick}
        />
      </StyledBody>
    </Card>
  );
};
