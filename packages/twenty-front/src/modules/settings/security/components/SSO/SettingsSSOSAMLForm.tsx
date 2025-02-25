/* @license Enterprise */

import { parseSAMLMetadataFromXMLFile } from '@/settings/security/utils/parseSAMLMetadataFromXMLFile';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { ChangeEvent, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { isDefined } from 'twenty-shared';
import {
  Button,
  H2Title,
  HorizontalSeparator,
  IconCheck,
  IconCopy,
  IconDownload,
  IconUpload,
  Section,
} from 'twenty-ui';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const StyledUploadFileContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFileInput = styled.input`
  display: none;
`;

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

export const SettingsSSOSAMLForm = () => {
  const { enqueueSnackBar } = useSnackBar();
  const theme = useTheme();
  const { setValue, getValues, watch, trigger } = useFormContext();
  const { t } = useLingui();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (isDefined(e.target.files)) {
      const text = await e.target.files[0].text();
      const samlMetadataParsed = parseSAMLMetadataFromXMLFile(text);
      e.target.value = '';
      if (!samlMetadataParsed.success) {
        return enqueueSnackBar(t`Invalid File`, {
          variant: SnackBarVariant.Error,
          duration: 2000,
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
      return enqueueSnackBar(t`Metadata file generation failed`, {
        variant: SnackBarVariant.Error,
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
          <HorizontalSeparator text={'Or'} />
          <StyledContainer>
            <StyledLinkContainer>
              <TextInput
                disabled={true}
                label="ACS Url"
                value={acsUrl}
                fullWidth
              />
            </StyledLinkContainer>
            <StyledButtonCopy>
              <Button
                Icon={IconCopy}
                title="Copy"
                onClick={() => {
                  enqueueSnackBar('ACS Url copied to clipboard', {
                    variant: SnackBarVariant.Success,
                    icon: <IconCopy size={theme.icon.size.md} />,
                    duration: 2000,
                  });
                  navigator.clipboard.writeText(acsUrl);
                }}
                type="button"
              />
            </StyledButtonCopy>
          </StyledContainer>
          <StyledContainer>
            <StyledLinkContainer>
              <TextInput
                disabled={true}
                label="Entity ID"
                value={entityID}
                fullWidth
              />
            </StyledLinkContainer>
            <StyledButtonCopy>
              <Button
                Icon={IconCopy}
                title={t`Copy`}
                onClick={() => {
                  enqueueSnackBar(t`Entity ID copied to clipboard`, {
                    variant: SnackBarVariant.Success,
                    icon: <IconCopy size={theme.icon.size.md} />,
                    duration: 2000,
                  });
                  navigator.clipboard.writeText(entityID);
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
