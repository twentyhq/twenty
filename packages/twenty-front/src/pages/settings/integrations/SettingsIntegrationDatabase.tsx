import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconSettings } from 'twenty-ui';

import { useGetDatabaseConnections } from '@/databases/hooks/useGetDatabaseConnections';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationDatabaseConnectionsListCard } from '@/settings/integrations/components/SettingsIntegrationDatabaseConnectionsListCard';
import { SettingsIntegrationPreview } from '@/settings/integrations/components/SettingsIntegrationPreview';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const SettingsIntegrationDatabase = () => {
  const { databaseKey = '' } = useParams();
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
