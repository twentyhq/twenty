import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { SettingsIntegrationWhatsappDatabaseConnectionForm } from '@/settings/integrations/meta/whatsapp/components/SettingsIntegrationWhatsappDatabaseConnectionForm';
import { useCreateWhatsappIntegration } from '@/settings/integrations/meta/whatsapp/hooks/useCreateWhatsappIntegration';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

import { z } from 'zod';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const settingsIntegrationWhatsappConnectionFormSchema = z.object({
  label: z.string().min(1),
  phoneId: z.string(),
  businessAccountId: z.string(),
  accessToken: z.string(),
  appId: z.string(),
  appKey: z.string(),
});

export type SettingsIntegrationWhatsappConnectionFormValues = z.infer<
  typeof settingsIntegrationWhatsappConnectionFormSchema
>;

export const SettingsIntegrationWhatsappNewDatabaseConnection = () => {
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueSnackBar } = useSnackBar();
  const settingsIntegrationsPagePath = getSettingsPath(
    SettingsPath.Integrations,
  );

  const { createWhatsappIntegration } = useCreateWhatsappIntegration();

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === 'whatsapp',
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
  const formConfig = useForm<SettingsIntegrationWhatsappConnectionFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsIntegrationWhatsappConnectionFormSchema),
  });

  const canSave = formConfig.formState.isValid;

  const handleSave = async () => {
    const formValues = formConfig.getValues();

    try {
      await createWhatsappIntegration({
        label: formValues.label,
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
      title="New Whatsapp Inbox"
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
        { children: 'New Whatsapp Inbox' },
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
              description="Start supporting your customers via WhatsApp"
            />
            <SettingsIntegrationWhatsappDatabaseConnectionForm />
          </Section>
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
