/* @license Enterprise */

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRadioCardContainer } from '@/settings/components/SettingsRadioCardContainer';
import { SettingsSsoOidcForm } from '@/settings/security/components/Sso/SettingsSsoOidcForm';
import { SettingsSsoSamlForm } from '@/settings/security/components/Sso/SettingsSsoSamlForm';
import { type SettingSecurityNewSsoIdentityFormValues } from '@/settings/security/types/SsoIdentityProvider';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactElement, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, type IconComponent, IconKey } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IdentityProviderType } from '~/generated-metadata/graphql';

const StyledInputsContainer = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
  grid-template-areas: 'input-1 input-1';
  grid-template-columns: 1fr 1fr;

  & :first-of-type {
    grid-area: input-1;
  }
`;

export const SettingsSsoIdentitiesProvidersForm = () => {
  const { control, watch } =
    useFormContext<SettingSecurityNewSsoIdentityFormValues>();

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
    Oidc: {
      option: {
        Icon: IconKey,
        title: 'Oidc',
        value: 'Oidc',
        description: '',
      },
      form: <SettingsSsoOidcForm />,
    },
    Saml: {
      option: {
        Icon: IconKey,
        title: 'Saml',
        value: 'Saml',
        description: '',
      },
      form: <SettingsSsoSamlForm />,
    },
  };

  const selectedType = watch('type');

  const formByType = useMemo(() => {
    switch (selectedType) {
      case IdentityProviderType.Oidc:
        return IdentitiesProvidersMap.Oidc.form;
      case IdentityProviderType.Saml:
        return IdentitiesProvidersMap.Saml.form;
      default:
        return null;
    }
  }, [
    IdentitiesProvidersMap.Oidc.form,
    IdentitiesProvidersMap.Saml.form,
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
                instanceId="Sso-identity-provider-name"
                autoComplete="off"
                label={t`Name`}
                value={value}
                onChange={onChange}
                fullWidth
                placeholder={t`Google Oidc`}
              />
            )}
          />
        </StyledInputsContainer>
      </Section>
      <Section>
        <H2Title
          title={t`Type`}
          description={t`Choose between Oidc and Saml protocols`}
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

export default SettingsSsoIdentitiesProvidersForm;
