import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationFocusNfeIssuerForm } from '@/settings/integrations/focus-nfe/components/SettingsIntegrationFocusNfeIssuerForm';
import { useCreateIssuer } from '@/settings/integrations/focus-nfe/hooks/useCreateIssuer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Section } from 'twenty-ui/layout';
import { z } from 'zod';
import { IssuerFormValues } from '~/types/Issuer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

// Basic Zod schema for validation - can be enhanced
const issuerFormSchema = z.object({
  name: z.string().min(1, 'Issuer name is required'),
  cnpj: z.string().min(1, 'CNPJ is required'), // Add CNPJ validation if needed
  cpf: z.string().optional().nullable(), // CPF validation if present
  ie: z.string().optional().nullable(),
  cnaeCode: z.string().optional().nullable(),
  cep: z.string().min(1, 'CEP is required'), // CEP validation
  street: z.string().min(1, 'Street is required'),
  number: z.string().min(1, 'Number is required'),
  neighborhood: z.string().min(1, 'Neighborhood is required'),
  city: z.string().min(1, 'City is required'),
  state: z
    .string()
    .min(1, 'State is required')
    .max(2, 'State should be 2 letters'), // Basic UF validation
  taxRegime: z.string().min(1, 'Tax regime is required'),
});

export const SettingsIntegrationFocusNfeNewIssuer = () => {
  const navigate = useNavigate();
  const { createIssuer, loading, error } = useCreateIssuer();
  const focusNFeSettingsPath = getSettingsPath(
    SettingsPath.IntegrationFocusNfe,
  );

  const methods = useForm<IssuerFormValues>({
    resolver: zodResolver(issuerFormSchema),
    defaultValues: {
      // Provide sensible defaults
      name: '',
      cnpj: '',
      cpf: '',
      ie: '',
      cnaeCode: '',
      cep: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      taxRegime: '',
    },
  });

  const { handleSubmit, formState } = methods;

  const onSubmit = async (data: IssuerFormValues) => {
    await createIssuer(data);
    if (!error) {
      navigate(focusNFeSettingsPath);
    }
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...methods}>
      <SubMenuTopBarContainer
        title="New"
        links={[
          {
            children: 'Workspace',
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: 'Integrations',
            href: getSettingsPath(SettingsPath.Integrations),
          },
          {
            children: 'Focus NFe',
            href: focusNFeSettingsPath,
          },
          { children: 'Add Issuer' },
        ]}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!formState.isValid || loading}
            onCancel={() => navigate(focusNFeSettingsPath)}
            onSave={handleSubmit(onSubmit)}
          />
        }
      >
        <SettingsPageContainer>
          <Section>
            <SettingsIntegrationFocusNfeIssuerForm disabled={loading} />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
