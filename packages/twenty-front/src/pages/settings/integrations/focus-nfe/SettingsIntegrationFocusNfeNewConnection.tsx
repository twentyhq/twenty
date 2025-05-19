import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationFocusNfeDatabaseConnectionForm } from '@/settings/integrations/focus-nfe/components/SettingsIntegrationFocusNfeDatabaseConnectionForm';
import { useCreateFocusNfeIntegration } from '@/settings/integrations/focus-nfe/hooks/useCreateFocusNfeIntegration';

import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { H2Title, Info } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { z } from 'zod';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const settingsIntegrationFocusNfeConnectionFormSchema = z.object({
  integrationName: z.string().min(1),
  token: z.string(),
});

export type SettingsIntegrationFocusNfeConnectionFormValues = z.infer<
  typeof settingsIntegrationFocusNfeConnectionFormSchema
>;

export const SettingsIntegrationFocusNfeNewDatabaseConnection = () => {
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueSnackBar } = useSnackBar();
  const settingsIntegrationsPagePath = getSettingsPath(
    SettingsPath.Integrations,
  );

  const { createFocusNfeIntegration } = useCreateFocusNfeIntegration();

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key.includes('focus'),
  );

  const isIntegrationAvailable = !!integration;

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigateApp(AppPath.NotFound);
    }
    // eslint-disable-next-line no-sparse-arrays
  }, [integration, , navigateApp, isIntegrationAvailable]);

  if (!isIntegrationAvailable) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formConfig = useForm<SettingsIntegrationFocusNfeConnectionFormValues>({
    mode: 'onChange',
    resolver: zodResolver(settingsIntegrationFocusNfeConnectionFormSchema),
  });

  const canSave = formConfig.formState.isValid;

  const handleSave = async () => {
    const formValues = formConfig.getValues();

    try {
      await createFocusNfeIntegration({
        integrationName: formValues.integrationName,
        token: formValues.token,
        status: 'active',
      });

      navigate(SettingsPath.IntegrationFocusNfe);
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title="New"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Integrations',
          href: settingsIntegrationsPagePath,
        },
        {
          children: integration.text,
          href: `${settingsIntegrationsPagePath}/focus-nfe`,
        },
        { children: 'New' },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => navigate(SettingsPath.IntegrationFocusNfe)}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <FormProvider
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...formConfig}
        >
          <Section>
            <H2Title
              title="Connect a new integration"
              description="Provide a name and an API to connect this workspace"
            />
            <Info
              text={'Read how to retrieve the API key'}
              to="https://focusnfe.com.br/doc/#introducao"
              buttonTitle="Go to doc"
            />
            <SettingsIntegrationFocusNfeDatabaseConnectionForm />
          </Section>
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
