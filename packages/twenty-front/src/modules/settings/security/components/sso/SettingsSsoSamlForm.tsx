import { parseSamlMetadataFromXmlFile } from '@/settings/security/utils/parseSamlMetadataFromXmlFile';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useContext, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconCopy, IconDownload, IconUpload } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { HorizontalSeparator, Section } from 'twenty-ui/primitives/layout';
import { H2Title } from 'twenty-ui/primitives/typography';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
/* @license Enterprise */

import { useToast } from 'twenty-ui/primitives/feedback';

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
  const { enqueueToast } = useToast();
  const { setValue, getValues, watch, trigger } = useFormContext();
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (isDefined(e.target.files)) {
      const text = await e.target.files[0].text();
      const samlMetadataParsed = parseSamlMetadataFromXmlFile(text);
      e.target.value = '';
      if (!samlMetadataParsed.success) {
        return enqueueToast({
          variant: 'error',
          children: t`Invalid file: ${samlMetadataParsed.reason}`,
          duration: 5000,
        });
      }
      setValue('ssoURL', samlMetadataParsed.data.ssoUrl);
      setValue('certificate', samlMetadataParsed.data.certificate);
      setValue('issuer', samlMetadataParsed.data.entityID);
      trigger();
    }
  };

  const entityID = `${REACT_APP_SERVER_BASE_URL}/auth/saml/login/${getValues('id')}`;
  const acsUrl = `${REACT_APP_SERVER_BASE_URL}/auth/saml/callback/${getValues('id')}`;

  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleUploadFileClick = () => {
    inputFileRef?.current?.click?.();
  };

  const ssoURL = watch('ssoURL');
  const certificate = watch('certificate');
  const issuer = watch('issuer');

  const isXMLMetadataValid = () => {
    return [ssoURL, certificate, issuer].every(
      (field) => isDefined(field) && field.length > 0,
    );
  };

  const downloadMetadata = async () => {
    const response = await fetch(
      `${REACT_APP_SERVER_BASE_URL}/auth/saml/metadata/${getValues('id')}`,
    );
    if (!response.ok) {
      return enqueueToast({
        variant: 'error',
        children: t`Metadata file generation failed`,
        duration: 2000,
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
            startIcon={<IconUpload />}
            onClick={handleUploadFileClick}
            type="button"
          >{t`Upload file`}</Button>
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
              startIcon={<IconDownload />}
              onClick={downloadMetadata}
              type="button"
            >{t`Download file`}</Button>
          </StyledContainer>
          <HorizontalSeparator text={t`Or`} />
          <StyledContainer>
            <StyledLinkContainer>
              <SettingsTextInput
                instanceId="sso-saml-acs-url"
                disabled={true}
                label={t`ACS URL`}
                value={acsUrl}
                fullWidth
              />
            </StyledLinkContainer>
            <StyledButtonCopy>
              <Button
                startIcon={<IconCopy />}
                onClick={() => {
                  copyToClipboard(acsUrl, t`ACS URL copied to clipboard`);
                }}
                type="button"
              >{t`Copy`}</Button>
            </StyledButtonCopy>
          </StyledContainer>
          <StyledContainer>
            <StyledLinkContainer>
              <SettingsTextInput
                instanceId="sso-saml-entity-id"
                disabled={true}
                label={t`Entity ID`}
                value={entityID}
                fullWidth
              />
            </StyledLinkContainer>
            <StyledButtonCopy>
              <Button
                startIcon={<IconCopy />}
                onClick={() => {
                  copyToClipboard(entityID, t`Entity ID copied to clipboard`);
                }}
                type="button"
              >{t`Copy`}</Button>
            </StyledButtonCopy>
          </StyledContainer>
        </StyledInputsContainer>
      </Section>
    </>
  );
};
