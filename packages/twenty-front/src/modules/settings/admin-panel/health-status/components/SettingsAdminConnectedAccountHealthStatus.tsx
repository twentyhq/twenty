import { SettingsAdminHealthAccountSyncCountersTable } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthAccountSyncCountersTable';
import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { AdminPanelHealthServiceStatus } from '~/generated-admin/graphql';

const StyledErrorMessage = styled.div`
  color: ${themeCssVariables.color.red};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

export const SettingsAdminConnectedAccountHealthStatus = () => {
  const { indicatorHealth } = useContext(SettingsAdminIndicatorHealthContext);
  const details = indicatorHealth.details;
  if (!details) {
    return null;
  }

  const parsedDetails = JSON.parse(details);
  const serviceDetails = parsedDetails.details;

  const isMessageSyncDown =
    serviceDetails.messageSync?.status === AdminPanelHealthServiceStatus.OUTAGE;
  const isCalendarSyncDown =
    serviceDetails.calendarSync?.status ===
    AdminPanelHealthServiceStatus.OUTAGE;

  const getErrorMessage = () => {
    if (isMessageSyncDown && isCalendarSyncDown) {
      return t`Message Sync and Calendar Sync are not available because the service is down`;
    }
    if (isMessageSyncDown) {
      return t`Message Sync is not available because the service is down`;
    }
    if (isCalendarSyncDown) {
      return t`Calendar Sync is not available because the service is down`;
    }
    return null;
  };

  const errorMessage = getErrorMessage();

  return (
    <StyledContainer>
      {errorMessage && <StyledErrorMessage>{errorMessage}</StyledErrorMessage>}

      {!isMessageSyncDown && serviceDetails.messageSync?.details && (
        <SettingsAdminHealthAccountSyncCountersTable
          details={serviceDetails.messageSync.details}
          title={t`Message Sync`}
          description={t`Monitor the execution of your emails sync job`}
        />
      )}

      {!isCalendarSyncDown && serviceDetails.calendarSync?.details && (
        <SettingsAdminHealthAccountSyncCountersTable
          details={serviceDetails.calendarSync.details}
          title={t`Calendar Sync`}
          description={t`Monitor the execution of your calendar events sync job`}
        />
      )}
    </StyledContainer>
  );
};
