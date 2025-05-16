/* eslint-disable react-hooks/rules-of-hooks */
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationFocusNfeDatabaseConnectionForm } from '@/settings/integrations/focus-nfe/components/SettingsIntegrationFocusNfeDatabaseConnectionForm';
import { useCriptographText } from '@/settings/integrations/focus-nfe/hooks/useCriptograph';
import { useGetAllFocusNfeIntegrationsByWorkspace } from '@/settings/integrations/focus-nfe/hooks/useGetAllFocusNfeIntegrationByWorkspace';
import { useUpdateFocusNfeIntegration } from '@/settings/integrations/focus-nfe/hooks/useUpdateFocusNfeIntegration';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { z } from 'zod';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const settingsIntegrationFocusNfeConnectionFormSchema = z.object({
  id: z.string(),
  integrationName: z.string().min(1),
  token: z.string(),
});

export type SettingsEditIntegrationFocusNfeConnectionFormValues = z.infer<
  typeof settingsIntegrationFocusNfeConnectionFormSchema
>;

export const SettingsIntegrationFocusNfeEditDatabaseConnection = () => {
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueSnackBar } = useSnackBar();
  const settingsIntegrationsPagePath = getSettingsPath(
    SettingsPath.Integrations,
  );
  const { decryptText } = useCriptographText();

  const { updateFocusNfeIntegration } = useUpdateFocusNfeIntegration();

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key.includes('focus'),
  );

  const { connectionId } = useParams<{ connectionId?: string }>();

  const { focusNfeIntegrations } = useGetAllFocusNfeIntegrationsByWorkspace();
  const activeConnection = focusNfeIntegrations.find(
    (wa) => wa.id === connectionId,
  );

  const isIntegrationAvailable = !!integration;

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigateApp(AppPath.NotFound);
    }
    // eslint-disable-next-line no-sparse-arrays
  }, [integration, navigateApp, isIntegrationAvailable]);

  if (!isIntegrationAvailable) return null;

  const formConfig =
    useForm<SettingsEditIntegrationFocusNfeConnectionFormValues>({
      mode: 'onChange',
      resolver: zodResolver(settingsIntegrationFocusNfeConnectionFormSchema),
      defaultValues: {
        id: activeConnection?.id,
        integrationName: activeConnection?.integrationName,
        token: decryptText(activeConnection?.token ?? ''),
      },
    });

  const canSave = formConfig.formState.isValid;

  const handleUpdate = async () => {
    const formValues = formConfig.getValues();

    try {
      await updateFocusNfeIntegration({
        id: formValues?.id,
        integrationName: formValues?.integrationName,
        token: formValues?.token,
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
      title={`Edit ${activeConnection?.integrationName}`}
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
        { children: `Edit ${activeConnection?.integrationName}` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => navigate(SettingsPath.IntegrationFocusNfe)}
          onSave={handleUpdate}
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
              title=""
              description="Edit the information to connect your integration"
            />
            <SettingsIntegrationFocusNfeDatabaseConnectionForm />
          </Section>
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
