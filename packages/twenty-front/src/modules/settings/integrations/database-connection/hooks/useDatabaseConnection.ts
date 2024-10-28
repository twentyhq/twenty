import { WatchQueryFetchPolicy } from '@apollo/client';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetDatabaseConnection } from '@/databases/hooks/useGetDatabaseConnection';
import { useGetDatabaseConnectionTables } from '@/databases/hooks/useGetDatabaseConnectionTables';
import { useIsSettingsIntegrationEnabled } from '@/settings/integrations/hooks/useIsSettingsIntegrationEnabled';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { AppPath } from '@/types/AppPath';

export const useDatabaseConnection = ({
  fetchPolicy,
}: {
  fetchPolicy?: WatchQueryFetchPolicy;
}) => {
  const { databaseKey = '', connectionId = '' } = useParams();
  const navigate = useNavigate();

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === databaseKey,
  );

  const isIntegrationEnabled = useIsSettingsIntegrationEnabled(databaseKey);

  const isIntegrationAvailable = !!integration && isIntegrationEnabled;

  const { connection, loading } = useGetDatabaseConnection({
    databaseKey,
    connectionId,
    skip: !isIntegrationAvailable,
    fetchPolicy,
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
    shouldFetchPendingSchemaUpdates: true,
    fetchPolicy,
  });

  return { connection, integration, databaseKey, tables };
};
