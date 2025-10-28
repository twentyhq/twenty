import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useGetDatabaseConnections } from '@/databases/hooks/useGetDatabaseConnections';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationPreview } from '@/settings/integrations/components/SettingsIntegrationPreview';
import { SettingsIntegrationDatabaseConnectionsListCard } from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseConnectionsListCard';
import { useIsSettingsIntegrationEnabled } from '@/settings/integrations/hooks/useIsSettingsIntegrationEnabled';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const SettingsIntegrationDatabase = () => {
  const { databaseKey = '' } = useParams();
  const navigateApp = useNavigateApp();

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === databaseKey,
  );

  const isIntegrationEnabled = useIsSettingsIntegrationEnabled(databaseKey);

  const isIntegrationAvailable = !!integration && isIntegrationEnabled;

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigateApp(AppPath.NotFound);
    }
  }, [integration, databaseKey, navigateApp, isIntegrationAvailable]);

  const { connections } = useGetDatabaseConnections({
    databaseKey,
    skip: !isIntegrationAvailable,
  });

  if (!isIntegrationAvailable) return null;

  return (
    <SubMenuTopBarContainer
      title={integration.text}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Integrations',
          href: getSettingsPath(SettingsPath.Integrations),
        },
        { children: integration.text },
      ]}
    >
      <SettingsPageContainer>
        <SettingsIntegrationPreview
          integrationLogoUrl={integration.from.image}
        />
        <Section>
          <H2Title
            title={`${integration.text} database`}
            description={`Connect or access your ${integration.text} data`}
          />
          <SettingsIntegrationDatabaseConnectionsListCard
            integration={integration}
            connections={connections}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
