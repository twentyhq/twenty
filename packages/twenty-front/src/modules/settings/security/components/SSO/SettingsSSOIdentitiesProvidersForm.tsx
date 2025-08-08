/* @license Enterprise */

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRadioCardContainer } from '@/settings/components/SettingsRadioCardContainer';
import { SettingsSSOOIDCForm } from '@/settings/security/components/SSO/SettingsSSOOIDCForm';
import { SettingsSSOSAMLForm } from '@/settings/security/components/SSO/SettingsSSOSAMLForm';
import { SettingSecurityNewSSOIdentityFormValues } from '@/settings/security/types/SSOIdentityProvider';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { ReactElement, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, IconComponent, IconKey } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { IdentityProviderType } from '~/generated/graphql';

const StyledInputsContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2, 4)};
  grid-template-columns: 1fr 1fr;
  grid-template-areas: 'input-1 input-1';

  & :first-of-type {
    grid-area: input-1;
  }
`;

export const SettingsSSOIdentitiesProvidersForm = () => {
  const { control, watch } =
    useFormContext<SettingSecurityNewSSOIdentityFormValues>();

  const IdentitiesProvidersMap: Record<
    IdentityProviderType,
    {
      form: ReactElement;
      option: {
        Icon: IconComponent;
        title: string;
        value: string;
        description: string;
      };
    }
  > = {
    OIDC: {
      option: {
        Icon: IconKey,
        title: 'OIDC',
        value: 'OIDC',
        description: '',
      },
      form: <SettingsSSOOIDCForm />,
    },
    SAML: {
      option: {
        Icon: IconKey,
        title: 'SAML',
        value: 'SAML',
        description: '',
      },
      form: <SettingsSSOSAMLForm />,
    },
  };

  const selectedType = watch('type');

  const formByType = useMemo(() => {
    switch (selectedType) {
      case IdentityProviderType.OIDC:
        return IdentitiesProvidersMap.OIDC.form;
      case IdentityProviderType.SAML:
        return IdentitiesProvidersMap.SAML.form;
      default:
        return null;
    }
  }, [
    IdentitiesProvidersMap.OIDC.form,
    IdentitiesProvidersMap.SAML.form,
    selectedType,
  ]);

  return (
    <SettingsPageContainer>
      <Section>
        <H2Title title={t`Name`} description={t`The name of your connection`} />
        <StyledInputsContainer>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <SettingsTextInput
                instanceId="sso-identity-provider-name"
                autoComplete="off"
                label={t`Name`}
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
          title={t`Type`}
          description={t`Choose between OIDC and SAML protocols`}
        />
        <StyledInputsContainer>
          <Controller
            name="type"
            control={control}
            render={({ field: { onChange, value } }) => (
              <SettingsRadioCardContainer
                value={value}
                options={Object.values(IdentitiesProvidersMap).map(
                  (identityProviderType) => identityProviderType.option,
                )}
                onChange={onChange}
              />
            )}
          />
        </StyledInputsContainer>
      </Section>
      {formByType}
    </SettingsPageContainer>
  );
};

export default SettingsSSOIdentitiesProvidersForm;
