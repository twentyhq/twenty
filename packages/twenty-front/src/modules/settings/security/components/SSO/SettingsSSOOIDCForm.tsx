/* @license Enterprise */

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, IconCopy } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2, 4)};
  width: 100%;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledLinkContainer = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledButtonCopy = styled.div`
  align-items: end;
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsSSOOIDCForm = () => {
  const { control } = useFormContext();
  const { copyToClipboard } = useCopyToClipboard();
  const { t } = useLingui();

  const authorizedUrl = window.location.origin;
  const redirectionUrl = `${REACT_APP_SERVER_BASE_URL}/auth/oidc/callback`;

  return (
    <>
      <Section>
        <H2Title
          title={t`Client Settings`}
          description={t`Provide your OIDC provider details`}
        />
        <StyledInputsContainer>
          <StyledContainer>
            <StyledLinkContainer>
              <SettingsTextInput
                instanceId="sso-oidc-authorized-uri"
                readOnly={true}
                label={t`Authorized URI`}
                value={authorizedUrl}
                fullWidth
              />
            </StyledLinkContainer>
            <StyledButtonCopy>
              <Button
                Icon={IconCopy}
                title={t`Copy`}
                onClick={() => {
                  copyToClipboard(
                    authorizedUrl,
                    t`Authorized URL copied to clipboard`,
                  );
                }}
                type="button"
              />
            </StyledButtonCopy>
          </StyledContainer>
          <StyledContainer>
            <StyledLinkContainer>
              <SettingsTextInput
                instanceId="sso-oidc-redirection-uri"
                readOnly={true}
                label={t`Redirection URI`}
                value={redirectionUrl}
                fullWidth
              />
            </StyledLinkContainer>
            <StyledButtonCopy>
              <Button
                Icon={IconCopy}
                title={t`Copy`}
                onClick={() => {
                  copyToClipboard(
                    redirectionUrl,
                    t`Redirect Url copied to clipboard`,
                  );
                }}
                type="button"
              />
            </StyledButtonCopy>
          </StyledContainer>
        </StyledInputsContainer>
      </Section>
      <Section>
        <H2Title
          title={t`Identity Provider`}
          description={t`Enter the credentials to set the connection`}
        />
        <StyledInputsContainer>
          <Controller
            name="clientID"
            control={control}
            render={({ field: { onChange, value } }) => (
              <SettingsTextInput
                instanceId="sso-oidc-client-id"
                autoComplete="off"
                label={t`Client ID`}
                value={value}
                onChange={onChange}
                fullWidth
                placeholder="900960562328-36306ohbk8e3.apps.googleusercontent.com"
              />
            )}
          />
          <Controller
            name="clientSecret"
            control={control}
            render={({ field: { onChange, value } }) => (
              <SettingsTextInput
                instanceId="sso-oidc-client-secret"
                autoComplete="off"
                type="password"
                label={t`Client Secret`}
                value={value}
                onChange={onChange}
                fullWidth
                placeholder="****************************"
              />
            )}
          />
          <Controller
            name="issuer"
            control={control}
            render={({ field: { onChange, value } }) => (
              <SettingsTextInput
                instanceId="sso-oidc-issuer"
                autoComplete="off"
                label={t`Issuer URI`}
                value={value}
                onChange={onChange}
                fullWidth
                placeholder="https://accounts.google.com"
              />
            )}
          />
        </StyledInputsContainer>
      </Section>
    </>
  );
};
