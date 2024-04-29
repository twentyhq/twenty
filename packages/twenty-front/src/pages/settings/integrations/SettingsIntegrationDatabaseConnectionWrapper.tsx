import { ReactNode, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconSettings } from 'twenty-ui';

import { useGetDatabaseConnection } from '@/databases/hooks/useGetDatabaseConnection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { AppPath } from '@/types/AppPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const SettingsIntegrationDatabaseConnectionWrapper = ({
  children,
}: {
  children: ReactNode;
}) => {
  const navigate = useNavigate();
  const { databaseKey = '', connectionId = '' } = useParams();
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
  });

  useEffect(() => {
    if (!isIntegrationAvailable || (!loading && !connection)) {
      navigate(AppPath.NotFound);
    }
  }, [
    integration,
    databaseKey,
    navigate,
    connection,
    loading,
    isIntegrationAvailable,
  ]);

  if (!isIntegrationAvailable || !connection) return null;

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>{children}</SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
