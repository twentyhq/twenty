/* eslint-disable react-hooks/rules-of-hooks */
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { SettingsIntegrationWhatsappDatabaseConnectionForm } from '@/settings/integrations/meta/whatsapp/components/SettingsIntegrationWhatsappDatabaseConnectionForm';
import { useFindAllWhatsappIntegrations } from '@/settings/integrations/meta/whatsapp/hooks/useFindAllWhatsappIntegrations';
import { useUpdateWhatsappIntegration } from '@/settings/integrations/meta/whatsapp/hooks/useUpdateWhatsappIntegration';
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

export const settingsEditIntegrationWhatsappConnectionFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  phoneId: z.string(),
  businessAccountId: z.string(),
  accessToken: z.string().min(1),
  appId: z.string(),
  appKey: z.string(),
});

export type SettingsEditIntegrationWhatsappConnectionFormValues = z.infer<
  typeof settingsEditIntegrationWhatsappConnectionFormSchema
>;

export const SettingsIntegrationWhatsappEditDatabaseConnection = () => {
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueSnackBar } = useSnackBar();
  const settingsIntegrationsPagePath = getSettingsPath(
    SettingsPath.Integrations,
  );

  const { updateWhatsappIntegration } = useUpdateWhatsappIntegration();

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === 'whatsapp',
  );

  const { connectionId } = useParams<{ connectionId?: string }>();

  const { whatsappIntegrations } = useFindAllWhatsappIntegrations();
  const activeConnection = whatsappIntegrations.find(
    (wa) => wa.id === connectionId,
  );

  const isIntegrationAvailable = !!integration;

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigateApp(AppPath.NotFound);
    }
    // eslint-disable-next-line no-sparse-arrays
  }, [integration, , navigateApp, isIntegrationAvailable]);

  if (!isIntegrationAvailable) return null;

  const formConfig =
    useForm<SettingsEditIntegrationWhatsappConnectionFormValues>({
      mode: 'onTouched',
      resolver: zodResolver(
        settingsEditIntegrationWhatsappConnectionFormSchema,
      ),
      defaultValues: {
        id: activeConnection?.id,
        name: activeConnection?.name,
        phoneId: activeConnection?.phoneId,
        businessAccountId: activeConnection?.businessAccountId,
        appId: activeConnection?.appId,
        appKey: activeConnection?.appKey,
      },
    });

  const canSave = formConfig.formState.isValid;

  const handleSave = async () => {
    const formValues = formConfig.getValues();

    try {
      await updateWhatsappIntegration({
        id: formValues.id,
        name: formValues.name,
        phoneId: formValues.phoneId,
        businessAccountId: formValues.businessAccountId,
        accessToken: formValues.accessToken,
        appId: formValues.appId,
        appKey: formValues.appKey,
      });

      navigate(SettingsPath.IntegrationWhatsappDatabase);
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={`Edit ${activeConnection?.name}`}
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
          href: `${settingsIntegrationsPagePath}/whatsapp`,
        },
        { children: `Edit ${activeConnection?.name}` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => navigate(SettingsPath.IntegrationWhatsappDatabase)}
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
              title=""
              description="Edit the information to connect your integration"
            />
            <SettingsIntegrationWhatsappDatabaseConnectionForm />
          </Section>
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
