import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconSettings } from 'twenty-ui';
import { z } from 'zod';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsIntegrationDatabaseConnectionForm,
  settingsIntegrationDatabaseConnectionFormSchema,
} from '@/settings/integrations/components/SettingsIntegrationDatabaseConnectionForm';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { AppPath } from '@/types/AppPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

const newConnectionSchema = settingsIntegrationDatabaseConnectionFormSchema;

type SettingsIntegrationNewConnectionFormValues = z.infer<
  typeof newConnectionSchema
>;

export const SettingsIntegrationNewDatabaseConnection = () => {
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

  const formConfig = useForm<SettingsIntegrationNewConnectionFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(newConnectionSchema),
  });

  if (!isIntegrationAvailable) return null;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
        <SettingsPageContainer>
          <Breadcrumb
            links={[
              { children: 'Integrations', href: '/settings/integrations' },
              {
                children: integration.text,
                href: `/settings/integrations/${databaseKey}`,
              },
              { children: 'New' },
            ]}
          />
          <Section>
            <H2Title
              title="Add a Database"
              description="Provide a name and an API to connect this workspace"
            />
            <SettingsIntegrationDatabaseConnectionForm />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
