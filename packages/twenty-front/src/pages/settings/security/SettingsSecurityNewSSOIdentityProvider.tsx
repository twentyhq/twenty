import { H2Title, IconKey } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsSSOOIDCForm } from '@/settings/security/components/SettingsSSOOIDCForm';
import { SettingsSSOSAMLForm } from '@/settings/security/components/SettingsSSOSAMLForm';
import { useCreateSSOIdentityProvider } from '@/settings/security/hooks/useCreateSSOIdentityProvider';

const StyledInputsContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2, 4)};
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    'input-1 input-1'
    'input-2 input-3'
    'input-4 input-5';

  & :first-of-type {
    grid-area: input-1;
  }
`;

const SSOIdentitiesProvidersOIDCParamsSchema = z
  .object({
    type: z.literal('OIDC'),
    clientID: z.string(),
    clientSecret: z.string(),
    issuer: z.string().url(),
  })
  .required();

const SSOIdentitiesProvidersSAMLParamsSchema = z
  .object({
    type: z.literal('SAML'),
  })
  .required();

const SSOIdentitiesProvidersParamsSchema = z
  .discriminatedUnion('type', [
    SSOIdentitiesProvidersOIDCParamsSchema,
    SSOIdentitiesProvidersSAMLParamsSchema,
  ])
  .and(
    z
      .object({
        name: z.string(),
      })
      .required(),
  );

export type SettingSecurityNewSSOIdentityFormValues = z.infer<
  typeof SSOIdentitiesProvidersParamsSchema
>;

export const SettingsSecurityNewSSOIdentityProvider = () => {
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();

  const { createSSOIdentityProvider } = useCreateSSOIdentityProvider();

  const formConfig = useForm<SettingSecurityNewSSOIdentityFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(SSOIdentitiesProvidersParamsSchema),
    defaultValues: {
      type: 'OIDC',
      name: '',
      clientID: '',
      clientSecret: '',
      issuer: '',
    },
  });

  const canSave = formConfig.formState.isValid;

  const handleSave = async () => {
    const { type, ...input } = formConfig.getValues();

    try {
      await createSSOIdentityProvider({
        type,
        // @ts-expect-error configure saml to fix that
        input,
      });
      navigate(getSettingsPagePath(SettingsPath.Security));
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      Icon={IconKey}
      title="New SSO Configuration"
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => navigate(getSettingsPagePath(SettingsPath.Security))}
          onSave={handleSave}
        />
      }
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        {
          children: 'Security',
          href: getSettingsPagePath(SettingsPath.Security),
        },
        { children: 'New' },
      ]}
    >
      <SettingsPageContainer>
        <FormProvider
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...formConfig}
        >
          <Section>
            <H2Title title="Name" description="The name of your connection" />
            <StyledInputsContainer>
              <Controller
                name="name"
                control={formConfig.control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    autoComplete="new-password" // Disable autocomplete
                    label="Name"
                    value={value}
                    onChange={onChange}
                    fullWidth
                    placeholder="Google OIDC"
                  />
                )}
              />
            </StyledInputsContainer>
          </Section>
          <Section>
            <H2Title
              title="Type"
              description="Choose between OIDC and SAML protocols"
            />
            <StyledInputsContainer>
              <Controller
                name="type"
                control={formConfig.control}
                render={({ field: { onChange, value } }) => (
                  <SettingsAccountsRadioSettingsCard
                    onChange={onChange}
                    name="type"
                    options={[
                      {
                        cardMedia: <IconKey />,
                        title: 'OIDC',
                        value: 'OIDC',
                        description: '',
                      },
                      {
                        cardMedia: <IconKey />,
                        title: 'SAML',
                        value: 'SAML',
                        description: '',
                      },
                    ]}
                    value={value}
                  />
                )}
              />
            </StyledInputsContainer>
          </Section>
          {formConfig.getValues().type === 'OIDC' ? (
            <SettingsSSOOIDCForm />
          ) : (
            <SettingsSSOSAMLForm />
          )}
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
