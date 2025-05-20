/* eslint-disable react-hooks/rules-of-hooks */
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationFocusNfeIssuerForm } from '@/settings/integrations/focus-nfe/components/SettingsIntegrationFocusNfeIssuerForm';
import { useGetAllIssuersByWorkspace } from '@/settings/integrations/focus-nfe/hooks/useGetAllIssuersByWorkspace';
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
import { useUpdateIssuer } from '~/hooks/useUpdateIssuer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
// Re-using IssuerFormValues for edit, but with ID

// Schema for the edit form
export const settingsIntegrationFocusNfeIssuerFormSchema = z.object({
  id: z.string(), // ID is crucial for updates
  name: z.string().min(1, 'Issuer name is required'),
  cnpj: z
    .string()
    .min(14, 'CNPJ must be 14 digits')
    .max(18, 'CNPJ is too long'), // Basic length, consider regex
  cpf: z.string().optional().nullable(), // Optional
  ie: z.string().optional().nullable(), // Optional
  cnaeCode: z.string().optional().nullable(), // Optional
  cep: z.string().min(8, 'CEP must be 8 digits').max(10, 'CEP is too long'), // Basic length, consider regex
  street: z.string().min(1, 'Street is required'),
  number: z.string().min(1, 'Number is required'),
  neighborhood: z.string().min(1, 'Neighborhood is required'),
  city: z.string().min(1, 'City is required'),
  state: z
    .string()
    .min(2, 'State must be 2 characters')
    .max(2, 'State must be 2 characters'),
  taxRegime: z.string().min(1, 'Tax regime is required'),
});

export type SettingsEditIssuerFormValues = z.infer<
  typeof settingsIntegrationFocusNfeIssuerFormSchema
>;

export const SettingsIntegrationFocusNfeEditIssuer = () => {
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueSnackBar } = useSnackBar();
  const settingsIntegrationsPagePath = getSettingsPath(
    SettingsPath.Integrations,
  );
  const focusNfeIntegrationsPagePath = getSettingsPath(
    SettingsPath.IntegrationFocusNfe,
  );

  const { updateIssuer } = useUpdateIssuer();

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key.includes('focus'),
  );

  const { issuerId } = useParams<{ issuerId?: string }>();

  const { issuers } = useGetAllIssuersByWorkspace();
  const activeIssuer = issuers.find((issuer) => issuer.id === issuerId);

  const isIntegrationAvailable = !!integration;

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigateApp(AppPath.NotFound);
    }
    if (issuerId && !activeIssuer && issuers.length > 0) {
      // Check if issuerId is provided but not found after issuers load
      enqueueSnackBar('Issuer not found.', { variant: SnackBarVariant.Error });
      navigate(SettingsPath.IntegrationFocusNfe);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    integration,
    navigateApp,
    isIntegrationAvailable,
    issuerId,
    activeIssuer,
    issuers.length,
    navigate,
  ]);

  const formConfig = useForm<SettingsEditIssuerFormValues>({
    mode: 'onChange',
    resolver: zodResolver(settingsIntegrationFocusNfeIssuerFormSchema),
    defaultValues: activeIssuer
      ? {
          id: activeIssuer.id,
          name: activeIssuer.name,
          cnpj: activeIssuer.cnpj,
          cpf: activeIssuer.cpf,
          ie: activeIssuer.ie,
          cnaeCode: activeIssuer.cnaeCode,
          cep: activeIssuer.cep,
          street: activeIssuer.street,
          number: activeIssuer.number,
          neighborhood: activeIssuer.neighborhood,
          city: activeIssuer.city,
          state: activeIssuer.state,
          taxRegime: activeIssuer.taxRegime,
        }
      : undefined,
  });

  useEffect(() => {
    if (activeIssuer) {
      formConfig.reset({
        id: activeIssuer.id,
        name: activeIssuer.name,
        cnpj: activeIssuer.cnpj,
        cpf: activeIssuer.cpf ?? '',
        ie: activeIssuer.ie ?? '',
        cnaeCode: activeIssuer.cnaeCode ?? '',
        cep: activeIssuer.cep,
        street: activeIssuer.street,
        number: activeIssuer.number,
        neighborhood: activeIssuer.neighborhood,
        city: activeIssuer.city,
        state: activeIssuer.state,
        taxRegime: activeIssuer.taxRegime,
      });
    }
  }, [activeIssuer, formConfig.reset, formConfig]);

  if (!isIntegrationAvailable || !activeIssuer) return null; // Render null if integration or issuer not found

  const canSave = formConfig.formState.isValid && formConfig.formState.isDirty;

  const handleUpdate = async () => {
    const formValues = formConfig.getValues();

    try {
      await updateIssuer({
        id: formValues.id,
        name: formValues.name,
        cnpj: formValues.cnpj,
        cpf: formValues.cpf || null, // Ensure empty strings become null
        ie: formValues.ie || null,
        cnaeCode: formValues.cnaeCode || null,
        cep: formValues.cep,
        street: formValues.street,
        number: formValues.number,
        neighborhood: formValues.neighborhood,
        city: formValues.city,
        state: formValues.state,
        taxRegime: formValues.taxRegime,
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
      title={`Edit ${activeIssuer?.name || 'Issuer'}`}
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
          href: focusNfeIntegrationsPagePath,
        },
        { children: `Edit ${activeIssuer?.name || 'Issuer'}` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => navigate(SettingsPath.IntegrationFocusNfe)}
          onSave={handleUpdate}
          saveButtonText="Save changes"
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
              title="Edit Issuer Information"
              description="Update the details for this issuer."
            />
            <SettingsIntegrationFocusNfeIssuerForm />
          </Section>
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
