import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetDatabaseConnection } from '@/databases/hooks/useGetDatabaseConnection';
import { useGetDatabaseConnectionTables } from '@/databases/hooks/useGetDatabaseConnectionTables';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { AppPath } from '@/types/AppPath';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const useDatabaseConnection = () => {
  const { databaseKey = '', connectionId = '' } = useParams();
  const navigate = useNavigate();

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === databaseKey,
  );

  const isAirtableIntegrationEnabled = useIsFeatureEnabled(
    'IS_AIRTABLE_INTEGRATION_ENABLED',
  );
  const isPostgresqlIntegrationEnabled = useIsFeatureEnabled(
    'IS_POSTGRESQL_INTEGRATION_ENABLED',
  );
  const isIntegrationAvailable =
    !!integration &&
    ((databaseKey === 'airtable' && isAirtableIntegrationEnabled) ||
      (databaseKey === 'postgresql' && isPostgresqlIntegrationEnabled));

  const { connection, loading } = useGetDatabaseConnection({
    databaseKey,
    connectionId,
    skip: !isIntegrationAvailable,
  });

  useEffect(() => {
    if (!isIntegrationAvailable || (!loading && !connection)) {
      navigate(AppPath.NotFound);
    }
  }, [
    integration,
    databaseKey,
    navigate,
    isIntegrationAvailable,
    connection,
    loading,
  ]);

  const { tables } = useGetDatabaseConnectionTables({
    connectionId,
    skip: !connection,
  });

  return { connection, integration, databaseKey, tables };
};
