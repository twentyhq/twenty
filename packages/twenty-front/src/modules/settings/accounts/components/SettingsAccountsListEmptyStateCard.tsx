import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  IconGoogle,
  IconMicrosoft,
} from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';

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
    FeatureFlagKey.IsMicrosoftSyncEnabled,
  );

  const { t } = useLingui();

  return (
    <Card>
      <StyledHeader>{label || t`No connected account`}</StyledHeader>
      <StyledBody>
        {currentWorkspace?.isGoogleAuthEnabled && (
          <Button
            Icon={IconGoogle}
            title={t`Connect with Google`}
            variant="secondary"
            onClick={() => triggerApisOAuth('google')}
          />
        )}
        {isMicrosoftSyncEnabled && currentWorkspace?.isMicrosoftAuthEnabled && (
          <Button
            Icon={IconMicrosoft}
            title={t`Connect with Microsoft`}
            variant="secondary"
            onClick={() => triggerApisOAuth('microsoft')}
          />
        )}
      </StyledBody>
    </Card>
  );
};
