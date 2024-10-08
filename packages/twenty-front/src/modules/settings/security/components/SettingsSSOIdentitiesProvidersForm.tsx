import { Controller, useFormContext } from 'react-hook-form';
import { Section } from '@/ui/layout/section/components/Section';
import { H2Title, IconKey } from 'twenty-ui';
import { TextInput } from '@/ui/input/components/TextInput';
import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsSSOOIDCForm } from '@/settings/security/components/SettingsSSOOIDCForm';
import { SettingsSSOSAMLForm } from '@/settings/security/components/SettingsSSOSAMLForm';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import styled from '@emotion/styled';
import { SettingSecurityNewSSOIdentityFormValues } from '@/settings/security/types/SSOIdentityProvider';

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

export const SettingsSSOIdentitiesProvidersForm = () => {
  const { control, getValues } =
    useFormContext<SettingSecurityNewSSOIdentityFormValues>();

  return (
    <SettingsPageContainer>
      <Section>
        <H2Title title="Name" description="The name of your connection" />
        <StyledInputsContainer>
          <Controller
            name="name"
            control={control}
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
            control={control}
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
      {getValues().type === 'OIDC' ? (
        <SettingsSSOOIDCForm />
      ) : (
        <SettingsSSOSAMLForm />
      )}
    </SettingsPageContainer>
  );
};

export default SettingsSSOIdentitiesProvidersForm;
