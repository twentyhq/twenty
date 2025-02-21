import { SettingsAdminHealthAccountSyncCountersTable } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthAccountSyncCountersTable';
import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { AdminPanelHealthServiceStatus } from '~/generated/graphql';

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const ConnectedAccountHealthStatus = () => {
  const { indicatorHealth } = useContext(SettingsAdminIndicatorHealthContext);
  const details = indicatorHealth.details;
  if (!details) {
    return null;
  }

  const parsedDetails = JSON.parse(details);

  const isMessageSyncDown =
    parsedDetails.messageSync?.status === AdminPanelHealthServiceStatus.OUTAGE;
  const isCalendarSyncDown =
    parsedDetails.calendarSync?.status === AdminPanelHealthServiceStatus.OUTAGE;

  const errorMessages = [];
  if (isMessageSyncDown) {
    errorMessages.push('Message Sync');
  }
  if (isCalendarSyncDown) {
    errorMessages.push('Calendar Sync');
  }

  return (
    <>
      {errorMessages.length > 0 && (
        <StyledErrorMessage>
          {`${errorMessages.join(' and ')} ${errorMessages.length > 1 ? 'are' : 'is'} not available because the service is down`}
        </StyledErrorMessage>
      )}

      {!isMessageSyncDown && parsedDetails.messageSync?.details && (
        <SettingsAdminHealthAccountSyncCountersTable
          details={parsedDetails.messageSync.details}
          title="Message Sync Status"
        />
      )}

      {!isCalendarSyncDown && parsedDetails.calendarSync?.details && (
        <SettingsAdminHealthAccountSyncCountersTable
          details={parsedDetails.calendarSync.details}
          title="Calendar Sync Status"
        />
      )}
    </>
  );
};
