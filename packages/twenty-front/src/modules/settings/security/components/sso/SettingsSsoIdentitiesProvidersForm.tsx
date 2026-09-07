/* @license Enterprise */

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRadioCardContainer } from '@/settings/components/SettingsRadioCardContainer';
import { SettingsSsoOidcForm } from '@/settings/security/components/sso/SettingsSsoOidcForm';
import { SettingsSsoSamlForm } from '@/settings/security/components/sso/SettingsSsoSamlForm';
import { type SettingSecurityNewSsoIdentityFormValues } from '@/settings/security/types/SsoIdentityProvider';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactElement, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { type IconComponent, IconKey } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
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
    OIDC: {
      option: {
        Icon: IconKey,
        title: 'OIDC',
        value: 'OIDC',
        description: '',
      },
      form: <SettingsSsoOidcForm />,
    },
    SAML: {
      option: {
        Icon: IconKey,
        title: 'SAML',
        value: 'SAML',
        description: '',
      },
      form: <SettingsSsoSamlForm />,
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
                placeholder={t`Google OIDC`}
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

export default SettingsSsoIdentitiesProvidersForm;
