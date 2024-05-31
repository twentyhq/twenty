import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { H2Title, IconSettings } from 'twenty-ui';

import { useGetDatabaseConnections } from '@/databases/hooks/useGetDatabaseConnections';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationPreview } from '@/settings/integrations/components/SettingsIntegrationPreview';
import { SettingsIntegrationDatabaseConnectionsListCard } from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseConnectionsListCard';
import { useIsSettingsIntegrationEnabled } from '@/settings/integrations/hooks/useIsSettingsIntegrationEnabled';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsIntegrationDatabase = () => {
  const { databaseKey = '' } = useParams();
  const navigate = useNavigate();

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === databaseKey,
  );

  const isIntegrationEnabled = useIsSettingsIntegrationEnabled(databaseKey);

  const isIntegrationAvailable = !!integration && isIntegrationEnabled;

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigate(AppPath.NotFound);
    }
  }, [integration, databaseKey, navigate, isIntegrationAvailable]);

  const { connections } = useGetDatabaseConnections({
    databaseKey,
    skip: !isIntegrationAvailable,
  });

  if (!isIntegrationAvailable) return null;

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            {
              children: 'Integrations',
              href: getSettingsPagePath(SettingsPath.Integrations),
            },
            { children: integration.text },
          ]}
        />
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
