import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { AppChip } from '@/applications/components/AppChip';
import { type AppPreferencesApplication } from '@/settings/app-preferences/types/AppPreferencesApplication';
import { getPreinstalledApplication } from '@/settings/app-preferences/utils/getPreinstalledApplication';
import { getPreinstalledApplicationIdsForAccount } from '@/settings/app-preferences/utils/getPreinstalledApplicationIdsForAccount';
import { styled } from '@linaria/react';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledIconContainer = styled.span`
  display: flex;
`;

type SettingsAppPreferencesAccountUsedByCellProps = {
  account: ConnectedAccount;
  application?: AppPreferencesApplication;
};

export const SettingsAppPreferencesAccountUsedByCell = ({
  account,
  application,
}: SettingsAppPreferencesAccountUsedByCellProps) => {
  const theme = useTheme();

  if (account.provider === ConnectedAccountProvider.APP) {
    return (
      <AppChip
        applicationId={account.applicationId}
        logoUrl={application?.logoUrl}
        fallbackApplicationData={{ name: application?.name }}
        size="md"
        chipOnly
      />
    );
  }

  return (
    <StyledContainer>
      {getPreinstalledApplicationIdsForAccount(account).map(
        (preinstalledApplicationId) => {
          const { Icon, name } = getPreinstalledApplication(
            preinstalledApplicationId,
          );

          return (
            <StyledIconContainer key={preinstalledApplicationId} title={name}>
              <Icon size={theme.icon.size.md} />
            </StyledIconContainer>
          );
        },
      )}
    </StyledContainer>
  );
};
