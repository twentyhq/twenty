import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { AppChip } from '@/applications/components/AppChip';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { getPreinstalledApplicationForProvider } from '@/settings/app-preferences/utils/getPreinstalledApplicationForProvider';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledPreinstalledApplication = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

type SettingsAppPreferencesConnectedAccountApplicationCellProps = {
  account: ConnectedAccount;
};

export const SettingsAppPreferencesConnectedAccountApplicationCell = ({
  account,
}: SettingsAppPreferencesConnectedAccountApplicationCellProps) => {
  const theme = useTheme();

  if (isDefined(account.applicationId)) {
    return <AppChip applicationId={account.applicationId} size="sm" />;
  }

  const preinstalledApplication = getPreinstalledApplicationForProvider(
    account.provider,
  );

  if (!isDefined(preinstalledApplication)) {
    return null;
  }

  const IconComponent = SettingsConnectedAccountIcon({ account });

  return (
    <StyledPreinstalledApplication>
      <IconComponent size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      <OverflowingTextWithTooltip text={preinstalledApplication.name} />
    </StyledPreinstalledApplication>
  );
};
