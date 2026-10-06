import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { AppChip } from '@/applications/components/AppChip';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { useAppPreferencesApplications } from '@/settings/app-preferences/hooks/useAppPreferencesApplications';
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
  const { applications } = useAppPreferencesApplications();

  if (isDefined(account.applicationId)) {
    const application = applications.find(
      ({ id }) => id === account.applicationId,
    );

    return (
      <AppChip
        applicationId={account.applicationId}
        fallbackApplicationData={{
          name: application?.name,
          logoUrl: application?.logoUrl,
        }}
        size="sm"
      />
    );
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
