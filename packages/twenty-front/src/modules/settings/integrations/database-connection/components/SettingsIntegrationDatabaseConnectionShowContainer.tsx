import { useDeleteOneDatabaseConnection } from '@/databases/hooks/useDeleteOneDatabaseConnection';
import { SettingsIntegrationDatabaseConnectionSummaryCard } from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseConnectionSummaryCard';
import { SettingsIntegrationDatabaseTablesListCard } from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseTablesListCard';
import { useDatabaseConnection } from '@/settings/integrations/database-connection/hooks/useDatabaseConnection';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { Section } from '@react-email/components';
import { useNavigate } from 'react-router-dom';
import { H2Title } from 'twenty-ui';

export const SettingsIntegrationDatabaseConnectionShowContainer = () => {
  const navigate = useNavigate();
  const { connection, integration, databaseKey, tables } =
    useDatabaseConnection({ fetchPolicy: 'network-only' });

  const { deleteOneDatabaseConnection } = useDeleteOneDatabaseConnection();

  if (!connection || !integration) {
    return null;
  }

  const deleteConnection = async () => {
    await deleteOneDatabaseConnection({ id: connection.id });

    navigate(`${settingsIntegrationsPagePath}/${databaseKey}`);
  };

  const settingsIntegrationsPagePath = getSettingsPagePath(
    SettingsPath.Integrations,
  );

  // TODO: move breadcrumb to header?
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
          { children: connection.label },
        ]}
      />
      <Section>
        <H2Title title="About" description="About this remote object" />
        <SettingsIntegrationDatabaseConnectionSummaryCard
          databaseLogoUrl={integration.from.image}
          connectionId={connection.id}
          connectionLabel={connection.label}
          onRemove={deleteConnection}
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
