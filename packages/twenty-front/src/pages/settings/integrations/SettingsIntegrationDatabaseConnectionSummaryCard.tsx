import styled from '@emotion/styled';

import { SettingsSummaryCard } from '@/settings/components/SettingsSummaryCard';
import { SettingsIntegrationDatabaseConnectedTablesStatus } from '@/settings/integrations/components/SettingsIntegrationDatabaseConnectedTablesStatus';

type SettingsIntegrationDatabaseConnectionSummaryCardProps = {
  databaseLogoUrl: string;
  connectionName: string;
  connectedTablesNb: number;
};

const StyledDatabaseLogoContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

const StyledDatabaseLogo = styled.img`
  height: 100%;
`;

export const SettingsIntegrationDatabaseConnectionSummaryCard = ({
  databaseLogoUrl,
  connectionName,
  connectedTablesNb,
}: SettingsIntegrationDatabaseConnectionSummaryCardProps) => (
  <SettingsSummaryCard
    title={
      <>
        <StyledDatabaseLogoContainer>
          <StyledDatabaseLogo alt="" src={databaseLogoUrl} />
        </StyledDatabaseLogoContainer>
        {connectionName}
      </>
    }
    rightComponent={
      <SettingsIntegrationDatabaseConnectedTablesStatus
        connectedTablesCount={connectedTablesNb}
      />
    }
  />
);
