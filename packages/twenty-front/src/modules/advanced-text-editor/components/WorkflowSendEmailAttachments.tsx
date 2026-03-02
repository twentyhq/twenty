import { WorkflowAttachmentChip } from '@/advanced-text-editor/components/WorkflowAttachmentChip';
import { useUploadWorkflowFile } from '@/advanced-text-editor/hooks/useUploadWorkflowFile';
import { InputLabel } from '@/ui/input/components/InputLabel';

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useContext, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowAttachment } from 'twenty-shared/workflow';
import { IconUpload } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type WorkflowSendEmailAttachmentsProps = {
  files: WorkflowAttachment[];
  onChange: (files: WorkflowAttachment[]) => void;
  label?: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledFileInput = styled.input`
  display: none;
`;

const StyledUploadArea = styled.div<{ hasFiles: boolean }>`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  min-height: ${({ hasFiles }) => (hasFiles ? 'auto' : '24px')};
  justify-content: center;
  padding-top: ${themeCssVariables.spacing[1]};
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};

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
  justify-content: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.secondary};
  gap: ${themeCssVariables.spacing[1]};
`;

export const WorkflowSendEmailAttachments = ({
  files,
  label,
  onChange,
}: WorkflowSendEmailAttachmentsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadWorkflowFile } = useUploadWorkflowFile();
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

  const handleAddFileClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    const isInsideChip = target.closest('[data-chip]') !== null;
    const isInsideButton = target.closest('button') !== null;
    const isSvgOrPath = target.tagName === 'svg' || target.tagName === 'path';

    if (isInsideChip || isInsideButton || isSvgOrPath) {
      return;
    }

    if (fileInputRef.current !== null) {
      fileInputRef.current.click();
    }
  };

  const onUploadFiles = async (filesToUpload: File[]) => {
    const uploadedFiles = await Promise.all(
      filesToUpload.map((file) => uploadWorkflowFile(file)),
    );

    const successfulUploads = uploadedFiles.filter(isDefined);

    if (successfulUploads.length > 0) {
      onChange([...files, ...successfulUploads]);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (isDefined(selectedFiles)) {
      onUploadFiles(Array.from(selectedFiles));
    }
    if (fileInputRef.current !== null) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    onChange(files.filter((file) => file.id !== fileId));
  };

  return (
    <StyledContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <StyledFileInput
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
      />

      <StyledUploadArea
        hasFiles={files.length > 0}
        onClick={handleAddFileClick}
      >
        {files.length > 0 ? (
          <StyledChipsContainer>
            {files.map((file: WorkflowAttachment) => (
              <WorkflowAttachmentChip
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
