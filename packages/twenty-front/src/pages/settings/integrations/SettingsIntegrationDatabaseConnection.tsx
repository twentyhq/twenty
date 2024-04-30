import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDeleteOneDatabaseConnection } from '@/databases/hooks/useDeleteOneDatabaseConnection';
import { SettingsIntegrationDatabaseTablesListCard } from '@/settings/integrations/components/SettingsIntegrationDatabaseTablesListCard';
import { SettingsIntegrationDatabaseConnectionWrapper } from '@/settings/integrations/components/wrappers/SettingsIntegrationDatabaseConnectionWrapper';
import { DatabaseConnectionContext } from '@/settings/integrations/contexts/DatabaseConnectionContext';
import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import { getConnectionDbName } from '@/settings/integrations/utils/getConnectionDbName';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { RemoteServer, RemoteTable } from '~/generated-metadata/graphql';
import { SettingsIntegrationDatabaseConnectionSummaryCard } from '~/pages/settings/integrations/SettingsIntegrationDatabaseConnectionSummaryCard';

export const SettingsIntegrationDatabaseConnection = () => {
  const navigate = useNavigate();
  const { integration, connection, databaseKey, tables } = useContext(
    DatabaseConnectionContext,
  ) as {
    integration: SettingsIntegration;
    connection: RemoteServer;
    databaseKey: string;
    tables: RemoteTable[] | undefined;
  };

  const { deleteOneDatabaseConnection } = useDeleteOneDatabaseConnection();

  const deleteConnection = async () => {
    if (!connection) return;

    await deleteOneDatabaseConnection({ id: connection.id });

    navigate(`${settingsIntegrationsPagePath}/${databaseKey}`);
  };

  const onEdit = () => {
    navigate('./edit');
  };

  const settingsIntegrationsPagePath = getSettingsPagePath(
    SettingsPath.Integrations,
  );

  const connectionName = getConnectionDbName({ integration, connection });

  return (
    <SettingsIntegrationDatabaseConnectionWrapper>
      <Breadcrumb
        links={[
          {
            children: 'Integrations',
            href: settingsIntegrationsPagePath,
          },
          {
            children: integration.text,
            href: `${settingsIntegrationsPagePath}/${databaseKey}`,
          },
          { children: connectionName },
        ]}
      />
      <Section>
        <H2Title title="About" description="About this remote object" />
        <SettingsIntegrationDatabaseConnectionSummaryCard
          databaseLogoUrl={integration.from.image}
          connectionId={connection.id}
          connectionName={connectionName}
          onRemove={deleteConnection}
          onEdit={onEdit}
        />
      </Section>
      <Section>
        <H2Title
          title="Tables"
          description="Select the tables that should be tracked"
        />
        {!!tables?.length && (
          <SettingsIntegrationDatabaseTablesListCard
            connectionId={connection.id}
            tables={tables}
          />
        )}
      </Section>
    </SettingsIntegrationDatabaseConnectionWrapper>
  );
};
