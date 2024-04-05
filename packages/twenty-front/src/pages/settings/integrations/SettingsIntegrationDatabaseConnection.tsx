import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconSettings } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsIntegrationDatabaseTablesListCard,
  SettingsIntegrationsDatabaseTablesFormValues,
  settingsIntegrationsDatabaseTablesSchema,
} from '@/settings/integrations/components/SettingsIntegrationDatabaseTablesListCard';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { SettingsIntegrationDatabaseConnectionSummaryCard } from '~/pages/settings/integrations/SettingsIntegrationDatabaseConnectionSummaryCard';
import { mockedRemoteObjectIntegrations } from '~/testing/mock-data/remoteObjectDatabases';

export const SettingsIntegrationDatabaseConnection = () => {
  const { databaseKey = '', connectionKey = '' } = useParams();
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

  const connections =
    mockedRemoteObjectIntegrations.find(
      ({ key }) => key === integration?.from.key,
    )?.connections || [];
  const connection = connections.find(({ key }) => key === connectionKey);

  useEffect(() => {
    if (!isIntegrationAvailable || !connection) {
      navigate(AppPath.NotFound);
    }
  }, [integration, databaseKey, navigate, isIntegrationAvailable, connection]);

  const formConfig = useForm<SettingsIntegrationsDatabaseTablesFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsIntegrationsDatabaseTablesSchema),
  });

  if (!isIntegrationAvailable || !connection) return null;

  const settingsIntegrationsPagePath = getSettingsPagePath(
    SettingsPath.Integrations,
  );

  const tables = mockedRemoteObjectIntegrations[0].connections[0].tables;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
        <SettingsPageContainer>
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
              { children: connection.name },
            ]}
          />
          <Section>
            <H2Title title="About" description="About this remote object" />
            <SettingsIntegrationDatabaseConnectionSummaryCard
              databaseLogoUrl={integration.from.image}
              connectionName={connection.name}
              connectedTablesNb={tables.length}
            />
          </Section>
          <Section>
            <H2Title
              title="Tables"
              description="Select the tables that should be tracked"
            />
            <SettingsIntegrationDatabaseTablesListCard tables={tables} />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
