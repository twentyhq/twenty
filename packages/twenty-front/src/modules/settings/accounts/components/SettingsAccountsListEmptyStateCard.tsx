import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  IconGoogle,
  IconMicrosoft,
} from 'twenty-ui';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';

const StyledHeader = styled(CardHeader)`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(6)};
`;

const StyledBody = styled(CardContent)`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type SettingsAccountsListEmptyStateCardProps = {
  label?: string;
};

export const SettingsAccountsListEmptyStateCard = ({
  label,
}: SettingsAccountsListEmptyStateCardProps) => {
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const isMicrosoftSyncEnabled = useIsFeatureEnabled(
    'IS_MICROSOFT_SYNC_ENABLED',
  );

  return (
    <Card>
      <StyledHeader>{label || 'No connected account'}</StyledHeader>
      <StyledBody>
        {currentWorkspace?.isGoogleAuthEnabled && (
          <Button
            Icon={IconGoogle}
            title="Connect with Google"
            variant="secondary"
            onClick={() => triggerApisOAuth('google')}
          />
        )}
        {isMicrosoftSyncEnabled && currentWorkspace?.isMicrosoftAuthEnabled && (
          <Button
            Icon={IconMicrosoft}
            title="Connect with Microsoft"
            variant="secondary"
            onClick={() => triggerApisOAuth('microsoft')}
          />
        )}
      </StyledBody>
    </Card>
  );
};
