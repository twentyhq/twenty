import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { type EmailAttachment } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconUpload } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { useUploadEmailAttachment } from '@/activities/emails/hooks/useUploadEmailAttachment';
import { AttachmentChip } from '@/file/components/AttachmentChip';
import { useFileUpload } from '@/file-upload/hooks/useFileUpload';
import { InputLabel } from '@/ui/input/components/InputLabel';

type EmailAttachmentsFieldProps = {
  files: EmailAttachment[];
  onChange: (files: EmailAttachment[]) => void;
  label?: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledUploadArea = styled.div<{ hasFiles: boolean }>`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: ${({ hasFiles }) => (hasFiles ? 'auto' : '24px')};
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[1]};

  &:hover {
    background-color: ${themeCssVariables.background.transparent.light};
    border-color: ${themeCssVariables.border.color.strong};
  }
`;

const StyledChipsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledUploadAreaLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
`;

export const EmailAttachmentsField = ({
  files,
  label,
  onChange,
}: EmailAttachmentsFieldProps) => {
  const { theme } = useContext(ThemeContext);
  const { uploadEmailAttachment } = useUploadEmailAttachment();
  const { openFileUpload } = useFileUpload();
  const { t } = useLingui();

  const handleUploadFiles = async (filesToUpload: File[]) => {
    const uploadedFiles = await Promise.all(
      filesToUpload.map((file) => uploadEmailAttachment(file)),
    );

    const successfulUploads = uploadedFiles.filter(isDefined);

    if (successfulUploads.length > 0) {
      onChange([...files, ...successfulUploads]);
    }
  };

  const handleAddFileClick = () => {
    openFileUpload({
      multiple: true,
      onUpload: handleUploadFiles,
    });
  };

  const handleRemoveFile = (fileId: string) => {
    onChange(files.filter((file) => file.id !== fileId));
  };

  return (
    <StyledContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <StyledUploadArea
        hasFiles={files.length > 0}
        onClick={handleAddFileClick}
      >
        {files.length > 0 ? (
          <StyledChipsContainer>
            {files.map((file) => (
              <AttachmentChip
                key={file.id}
                file={file}
                onRemove={() => handleRemoveFile(file.id)}
              />
            ))}
          </StyledChipsContainer>
        ) : (
          <StyledUploadAreaLabel>
            <IconUpload size={theme.icon.size.sm} />
            <span>{t`Upload file`}</span>
          </StyledUploadAreaLabel>
        )}
      </StyledUploadArea>
    </StyledContainer>
  );
};
