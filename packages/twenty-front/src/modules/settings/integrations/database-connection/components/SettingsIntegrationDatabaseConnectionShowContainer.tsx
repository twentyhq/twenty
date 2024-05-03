import { useNavigate } from 'react-router-dom';
import { Section } from '@react-email/components';

import { useDeleteOneDatabaseConnection } from '@/databases/hooks/useDeleteOneDatabaseConnection';
import { SettingsIntegrationDatabaseConnectionSummaryCard } from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseConnectionSummaryCard';
import { SettingsIntegrationDatabaseTablesListCard } from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseTablesListCard';
import { useDatabaseConnection } from '@/settings/integrations/database-connection/hooks/useDatabaseConnection';
import { getConnectionDbName } from '@/settings/integrations/utils/getConnectionDbName';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsIntegrationDatabaseConnectionShowContainer = () => {
  const navigate = useNavigate();
  const { connection, integration, databaseKey, tables } =
    useDatabaseConnection();

  const { deleteOneDatabaseConnection } = useDeleteOneDatabaseConnection();

  if (!connection || !integration) {
    return null;
  }

  const deleteConnection = async () => {
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
    <>
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
    </>
  );
};
