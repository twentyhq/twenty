import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { SettingsConnectedAccountSyncStatus } from '@/settings/app-preferences/components/SettingsConnectedAccountSyncStatus';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconChevronRight } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledNameCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

type GettingStartedConnectedAccountRowProps = {
  account: ConnectedAccount;
};

export const GettingStartedConnectedAccountRow = ({
  account,
}: GettingStartedConnectedAccountRowProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const navigateSettings = useNavigateSettings();
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const ProviderIcon = SettingsConnectedAccountIcon({ account });

  const openAccountSettings = () =>
    isAppPreferencesEnabled
      ? navigateSettings(SettingsPath.AppPreferencesAccountDetail, {
          connectedAccountId: account.id,
        })
      : navigateSettings(SettingsPath.Accounts);

  return (
    <TableRow gridTemplateColumns="minmax(0, 1fr) auto">
      <TableCell>
        <StyledNameCell>
          <ProviderIcon
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
          {account.handle}
        </StyledNameCell>
      </TableCell>
      <TableCell align="right">
        <StyledRightContainer>
          <SettingsConnectedAccountSyncStatus account={account} />
          <LightIconButton
            emphasis="subtle"
            aria-label={t`Open ${account.handle} settings`}
            onClick={openAccountSettings}
          >
            <IconChevronRight />
          </LightIconButton>
        </StyledRightContainer>
      </TableCell>
    </TableRow>
  );
};
