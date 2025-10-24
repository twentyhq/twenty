import { InputLabel } from '@/ui/input/components/InputLabel';
import { WorkflowAttachmentChip } from '@/advanced-text-editor/components/WorkflowAttachmentChip';
import { useUploadWorkflowFile } from '@/advanced-text-editor/hooks/useUploadWorkflowFile';

import { type WorkflowAttachmentType } from '@/workflow/workflow-steps/workflow-actions/email-action/types/WorkflowAttachmentType';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconUpload } from 'twenty-ui/display';
import { useTheme } from '@emotion/react';

type WorkflowSendEmailAttachmentsProps = {
  files: WorkflowAttachmentType[];
  onChange: (files: WorkflowAttachmentType[]) => void;
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
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  min-height: ${({ hasFiles }) => (hasFiles ? 'auto' : '24px')};
  justify-content: center;
  padding-top: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
    border-color: ${({ theme }) => theme.border.color.strong};
  }
`;

const StyledChipsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledUploadAreaLabel = styled.div`
  justify-content: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.secondary};
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const WorkflowSendEmailAttachments = ({
  files,
  label,
  onChange,
}: WorkflowSendEmailAttachmentsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadWorkflowFile } = useUploadWorkflowFile();
  const { t } = useLingui();
  const theme = useTheme();

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

    const successfulUploads = uploadedFiles.filter(
      (file): file is WorkflowAttachmentType => file !== null,
    );

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
            {files.map((file: WorkflowAttachmentType) => (
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
