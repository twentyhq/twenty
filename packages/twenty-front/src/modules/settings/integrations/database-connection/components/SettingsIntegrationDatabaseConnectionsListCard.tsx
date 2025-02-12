import styled from '@emotion/styled';
import { IconChevronRight, LightIconButton } from 'twenty-ui';

import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsIntegrationDatabaseConnectionSyncStatus } from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseConnectionSyncStatus';
import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import { SettingsPath } from '@/types/SettingsPath';
import { RemoteServer } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type SettingsIntegrationDatabaseConnectionsListCardProps = {
  integration: SettingsIntegration;
  connections: RemoteServer[];
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

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsIntegrationDatabaseConnectionsListCard = ({
  integration,
  connections,
}: SettingsIntegrationDatabaseConnectionsListCardProps) => {
  const navigate = useNavigateSettings();

  return (
    <SettingsListCard
      items={connections}
      RowIcon={() => (
        <StyledDatabaseLogoContainer>
          <StyledDatabaseLogo alt="" src={integration.from.image} />
        </StyledDatabaseLogoContainer>
      )}
      RowRightComponent={({ item: connection }) => (
        <StyledRowRightContainer>
          <SettingsIntegrationDatabaseConnectionSyncStatus
            connectionId={connection.id}
          />
          <LightIconButton Icon={IconChevronRight} accent="tertiary" />
        </StyledRowRightContainer>
      )}
      onRowClick={(connection) =>
        navigate(SettingsPath.IntegrationDatabaseConnection, {
          databaseKey: integration.from.key,
          connectionId: connection.id,
        })
      }
      getItemLabel={(connection) => connection.label}
      hasFooter
      footerButtonLabel="Add connection"
      onFooterButtonClick={() =>
        navigate(SettingsPath.IntegrationNewDatabaseConnection, {
          databaseKey: integration.from.key,
        })
      }
    />
  );
};
