import { SettingsAdminHealthAccountSyncCountersTable } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthAccountSyncCountersTable';
import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { AdminPanelHealthServiceStatus } from '~/generated-metadata/graphql';

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
`;

export const ConnectedAccountHealthStatus = () => {
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

  const errorMessages = [];
  if (isMessageSyncDown) {
    errorMessages.push('Message Sync');
  }
  if (isCalendarSyncDown) {
    errorMessages.push('Calendar Sync');
  }

  return (
    <StyledContainer>
      {errorMessages.length > 0 && (
        <StyledErrorMessage>
          {`${errorMessages.join(' and ')} ${errorMessages.length > 1 ? 'are' : 'is'} not available because the service is down`}
        </StyledErrorMessage>
      )}

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
