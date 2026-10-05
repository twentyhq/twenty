import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  type ApplicationVariableFileValue,
  parseApplicationVariableFilesValue,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton, useToast } from 'twenty-ui/components';
import { IconUpload, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { downloadFile } from '@/activities/files/utils/downloadFile';
import { useFileUpload } from '@/file-upload/hooks/useFileUpload';
import { FileChip } from '@/ui/field/display/components/FileChip';

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFileRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

type SettingsApplicationVariableFilesInputProps = {
  uploadFile: (file: File) => Promise<ApplicationVariableFileValue>;
  value: string;
  onChange: (serializedValue: string) => void;
  disabled?: boolean;
};

export const SettingsApplicationVariableFilesInput = ({
  uploadFile,
  value,
  onChange,
  disabled,
}: SettingsApplicationVariableFilesInputProps) => {
  const { t } = useLingui();
  const { openFileUpload } = useFileUpload();
  const { enqueueToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const files = parseApplicationVariableFilesValue(value);

  const emitChange = (nextFiles: ApplicationVariableFileValue[]) => {
    onChange(nextFiles.length === 0 ? '' : JSON.stringify(nextFiles));
  };

  const handleRemove = (fileIdToRemove: string) => {
    emitChange(files.filter(({ fileId }) => fileId !== fileIdToRemove));
  };

  const handleOpen = ({ url, label }: ApplicationVariableFileValue) => {
    if (!isDefined(url)) {
      return;
    }

    downloadFile(url, label).catch(() => {
      enqueueToast({
        variant: 'error',
        children: t`Failed to download file`,
      });
    });
  };

  const handleUploadClick = () => {
    if (isUploading) {
      return;
    }

    openFileUpload({
      multiple: true,
      onUpload: async (selectedFiles: File[]) => {
        setIsUploading(true);

        const uploadedFiles: ApplicationVariableFileValue[] = [];

        try {
          for (const selectedFile of selectedFiles) {
            uploadedFiles.push(await uploadFile(selectedFile));
          }
        } catch {
          enqueueToast({
            variant: 'error',
            children: t`Failed to upload file`,
          });
        } finally {
          setIsUploading(false);
        }

        if (uploadedFiles.length > 0) {
          emitChange([...files, ...uploadedFiles]);
        }
      },
    });
  };

  return (
    <StyledContainer>
      {files.map((file) => (
        <StyledFileRow key={file.fileId}>
          <FileChip
            file={file}
            onClick={handleOpen}
            forceDisableClick={!isDefined(file.url)}
          />
          <LightIconButton
            emphasis="subtle"
            aria-label={t`Remove file`}
            onClick={() => handleRemove(file.fileId)}
            disabled={disabled || isUploading}
          >
            <IconX />
          </LightIconButton>
        </StyledFileRow>
      ))}
      <Button
        variant="outline"
        size="sm"
        startIcon={<IconUpload />}
        onClick={handleUploadClick}
        disabled={disabled}
        loading={isUploading}
      >
        {isUploading ? t`Uploading...` : t`Upload file`}
      </Button>
    </StyledContainer>
  );
};
