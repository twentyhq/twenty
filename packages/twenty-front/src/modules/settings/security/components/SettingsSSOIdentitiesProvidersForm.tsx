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
import { IdpType } from '~/generated/graphql';
import { ReactElement } from 'react';

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

  const IdpMap: Record<
    IdpType,
    {
      form: ReactElement;
      card: {
        cardMedia: ReactElement;
        title: string;
        value: string;
        description: string;
      };
    }
  > = {
    OIDC: {
      card: {
        cardMedia: <IconKey />,
        title: 'OIDC',
        value: 'OIDC',
        description: '',
      },
      form: <SettingsSSOOIDCForm />,
    },
    SAML: {
      card: {
        cardMedia: <IconKey />,
        title: 'SAML',
        value: 'SAML',
        description: '',
      },
      form: <SettingsSSOSAMLForm />,
    },
  };

  const getFormByType = (type: Uppercase<IdpType> | undefined) => {
    switch (type) {
      case IdpType.Oidc:
        return IdpMap.OIDC.form;
      case IdpType.Saml:
        return IdpMap.SAML.form;
      default:
        return null;
    }
  };

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
                autoComplete="off"
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
                options={Object.values(IdpMap).map(({ card }) => card)}
                value={value}
              />
            )}
          />
        </StyledInputsContainer>
      </Section>
      {getFormByType(getValues().type)}
    </SettingsPageContainer>
  );
};

export default SettingsSSOIdentitiesProvidersForm;
