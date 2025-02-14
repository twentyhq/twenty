/* @license Enterprise */

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';
import { Button, H2Title, IconCopy, Section } from 'twenty-ui';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

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
`;

export const SettingsSSOOIDCForm = () => {
  const { control } = useFormContext();
  const { enqueueSnackBar } = useSnackBar();
  const theme = useTheme();

  const authorizedUrl = window.location.origin;
  const redirectionUrl = `${REACT_APP_SERVER_BASE_URL}/auth/oidc/callback`;

  return (
    <>
      <Section>
        <H2Title
          title="Client Settings"
          description="Provide your OIDC provider details"
        />
        <StyledInputsContainer>
          <StyledContainer>
            <StyledLinkContainer>
              <TextInput
                readOnly={true}
                label="Authorized URI"
                value={authorizedUrl}
                fullWidth
              />
            </StyledLinkContainer>
            <StyledButtonCopy>
              <Button
                Icon={IconCopy}
                title="Copy"
                onClick={() => {
                  enqueueSnackBar('Authorized Url copied to clipboard', {
                    variant: SnackBarVariant.Success,
                    icon: <IconCopy size={theme.icon.size.md} />,
                    duration: 2000,
                  });
                  navigator.clipboard.writeText(authorizedUrl);
                }}
              />
            </StyledButtonCopy>
          </StyledContainer>
          <StyledContainer>
            <StyledLinkContainer>
              <TextInput
                readOnly={true}
                label="Redirection URI"
                value={redirectionUrl}
                fullWidth
              />
            </StyledLinkContainer>
            <StyledButtonCopy>
              <Button
                Icon={IconCopy}
                title="Copy"
                onClick={() => {
                  enqueueSnackBar('Redirect Url copied to clipboard', {
                    variant: SnackBarVariant.Success,
                    icon: <IconCopy size={theme.icon.size.md} />,
                    duration: 2000,
                  });
                  navigator.clipboard.writeText(redirectionUrl);
                }}
              />
            </StyledButtonCopy>
          </StyledContainer>
        </StyledInputsContainer>
      </Section>
      <Section>
        <H2Title
          title="Identity Provider"
          description="Enter the credentials to set the connection"
        />
        <StyledInputsContainer>
          <Controller
            name="clientID"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                autoComplete="off"
                label="Client ID"
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
              <TextInput
                autoComplete="off"
                type="password"
                label="Client Secret"
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
              <TextInput
                autoComplete="off"
                label="Issuer URI"
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
