import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconSettings } from 'twenty-ui';
import { z } from 'zod';

import { useCreateOneDatabaseConnection } from '@/databases/hooks/useCreateOneDatabaseConnection';
import { getForeignDataWrapperType } from '@/databases/utils/getForeignDataWrapperType';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsIntegrationPostgreSQLConnectionForm,
  settingsIntegrationPostgreSQLConnectionFormSchema,
} from '@/settings/integrations/components/SettingsIntegrationDatabaseConnectionForm';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { CreateRemoteServerInput } from '~/generated-metadata/graphql';

const newConnectionSchema = settingsIntegrationPostgreSQLConnectionFormSchema;

const createRemoteServerInputSchema = newConnectionSchema
  .extend({
    foreignDataWrapperType: z.string().min(1),
  })
  .transform<CreateRemoteServerInput>((values) => ({
    foreignDataWrapperType: values.foreignDataWrapperType,
    foreignDataWrapperOptions: {
      dbname: values.dbname,
      host: values.host,
      port: values.port,
    },
    userMappingOptions: {
      password: values.password,
      user: values.username,
    },
  }));

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

  const { createOneDatabaseConnection } = useCreateOneDatabaseConnection();
  const { enqueueSnackBar } = useSnackBar();

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

  const settingsIntegrationsPagePath = getSettingsPagePath(
    SettingsPath.Integrations,
  );

  const canSave = formConfig.formState.isValid;

  const handleSave = async () => {
    const formValues = formConfig.getValues();

    try {
      await createOneDatabaseConnection(
        createRemoteServerInputSchema.parse({
          ...formValues,
          foreignDataWrapperType: getForeignDataWrapperType(databaseKey),
        }),
      );

      navigate(`${settingsIntegrationsPagePath}/${databaseKey}`);
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: 'error',
      });
    }
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
        <SettingsPageContainer>
          <SettingsHeaderContainer>
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
                { children: 'New' },
              ]}
            />
            <SaveAndCancelButtons
              isSaveDisabled={!canSave}
              onCancel={() =>
                navigate(`${settingsIntegrationsPagePath}/${databaseKey}`)
              }
              onSave={handleSave}
            />
          </SettingsHeaderContainer>
          {databaseKey === 'postgresql' ? (
            <Section>
              <H2Title
                title="Connect a new database"
                description="Provide the information to connect your PostgreSQL database"
              />
              <SettingsIntegrationPostgreSQLConnectionForm />
            </Section>
          ) : null}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
