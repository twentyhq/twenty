/* @license Enterprise */

import { parseSamlMetadataFromXMLFile } from '@/settings/security/utils/parseSamlMetadataFromXMLFile';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { type ChangeEvent, useContext, useRef } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useFormContext } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  HorizontalSeparator,
  IconCheck,
  IconCopy,
  IconDownload,
  IconUpload,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledUploadFileContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFileInput = styled.input`
  display: none;
`;

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledLinkContainer = styled.div`
  flex: 1;
  margin-right: ${themeCssVariables.spacing[2]};
`;

const StyledButtonCopy = styled.div`
  align-items: end;
  display: flex;
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

export const SettingsSsoSamlForm = () => {
  const { theme } = useContext(ThemeContext);
  const { enqueueErrorSnackBar } = useSnackBar();
  const { setValue, getValues, watch, trigger } = useFormContext();
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (isDefined(e.target.files)) {
      const text = await e.target.files[0].text();
      const SamlMetadataParsed = parseSamlMetadataFromXMLFile(text);
      e.target.value = '';
      if (!SamlMetadataParsed.success) {
        return enqueueErrorSnackBar({
          message: t`Invalid File`,
          options: {
            duration: 2000,
          },
        });
      }
      setValue('ssoUrl', SamlMetadataParsed.data.ssoUrl);
      setValue('certificate', SamlMetadataParsed.data.certificate);
      setValue('issuer', SamlMetadataParsed.data.entityID);
      trigger();
    }
  };

  const entityID = `${REACT_APP_SERVER_BASE_URL}/auth/Saml/login/${getValues('id')}`;
  const acsUrl = `${REACT_APP_SERVER_BASE_URL}/auth/Saml/callback/${getValues('id')}`;

  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleUploadFileClick = () => {
    inputFileRef?.current?.click?.();
  };

  const ssoUrl = watch('ssoUrl');
  const certificate = watch('certificate');
  const issuer = watch('issuer');

  const isXMLMetadataValid = () => {
    return [ssoUrl, certificate, issuer].every(
      (field) => isDefined(field) && field.length > 0,
    );
  };

  const downloadMetadata = async () => {
    const response = await fetch(
      `${REACT_APP_SERVER_BASE_URL}/auth/Saml/metadata/${getValues('id')}`,
    );
    if (!response.ok) {
      return enqueueErrorSnackBar({
        message: t`Metadata file generation failed`,
        options: {
          duration: 2000,
        },
      });
    }
    const text = await response.text();
    const blob = new Blob([text], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metadata.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <Section>
        <H2Title
          title={t`Identity Provider Metadata XML`}
          description={t`Upload the XML file with your connection infos`}
        />
        <StyledUploadFileContainer>
          <StyledFileInput
            ref={inputFileRef}
            onChange={handleFileChange}
            type="file"
            accept=".xml"
          />
          <Button
            Icon={IconUpload}
            onClick={handleUploadFileClick}
            title={t`Upload file`}
            type="button"
          ></Button>
          {isXMLMetadataValid() && (
            <IconCheck
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.lg}
              color={theme.color.blue}
            />
          )}
        </StyledUploadFileContainer>
      </Section>
      <Section>
        <H2Title
          title={t`Service Provider Details`}
          description={t`Enter the infos to set the connection`}
        />
        <StyledInputsContainer>
          <StyledContainer>
            <Button
              Icon={IconDownload}
              onClick={downloadMetadata}
              title={t`Download file`}
              type="button"
            />
          </StyledContainer>
          <HorizontalSeparator text={t`Or`} />
          <StyledContainer>
            <StyledLinkContainer>
              <SettingsTextInput
                instanceId="Sso-Saml-acs-url"
                disabled={true}
                label={t`ACS Url`}
                value={acsUrl}
                fullWidth
              />
            </StyledLinkContainer>
            <StyledButtonCopy>
              <Button
                Icon={IconCopy}
                title={t`Copy`}
                onClick={() => {
                  copyToClipboard(acsUrl, t`ACS Url copied to clipboard`);
                }}
                type="button"
              />
            </StyledButtonCopy>
          </StyledContainer>
          <StyledContainer>
            <StyledLinkContainer>
              <SettingsTextInput
                instanceId="Sso-Saml-entity-id"
                disabled={true}
                label={t`Entity ID`}
                value={entityID}
                fullWidth
              />
            </StyledLinkContainer>
            <StyledButtonCopy>
              <Button
                Icon={IconCopy}
                title={t`Copy`}
                onClick={() => {
                  copyToClipboard(entityID, t`Entity ID copied to clipboard`);
                }}
                type="button"
              />
            </StyledButtonCopy>
          </StyledContainer>
        </StyledInputsContainer>
      </Section>
    </>
  );
};
