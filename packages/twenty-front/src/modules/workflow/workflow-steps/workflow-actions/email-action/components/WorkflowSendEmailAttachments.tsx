import { ActivityList } from '@/activities/components/ActivityList';
import { WorkflowAttachmentRow } from '@/workflow/workflow-steps/workflow-actions/email-action/components/WorkflowAttachmentRow';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useUploadWorkflowFile } from '@/workflow/workflow-steps/workflow-actions/email-action/hooks/useUploadWorkflowFile';

type WorkflowFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
};

type WorkflowSendEmailAttachmentsProps = {
  files: WorkflowFile[];
  onChange: (files: WorkflowFile[]) => void;
  readonly?: boolean;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledCount = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledFileInput = styled.input`
  display: none;
`;

const StyledFileList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const WorkflowSendEmailAttachments = ({
  files,
  onChange,
  readonly = false,
}: WorkflowSendEmailAttachmentsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadWorkflowFile } = useUploadWorkflowFile();

  const { t } = useLingui();

  const handleAddFileClick = () => {
    fileInputRef.current?.click();
  };

  const onUploadFile = async (file: File) => {
    const uploadedFile = await uploadWorkflowFile(file);
    if (uploadedFile !== null) {
      onChange([...files, uploadedFile]);
    }
  };

  const onUploadFiles = async (filesToUpload: File[]) => {
    setIsUploading(true);
    try {
      for (const file of filesToUpload) {
        await onUploadFile(file);
      }
    } finally {
      setIsUploading(false);
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
      <StyledHeader>
        <StyledLabel>
          {t`Attachments`}
          {files.length > 0 && <StyledCount>({files.length})</StyledCount>}
        </StyledLabel>
      </StyledHeader>

      {files.length > 0 && (
        <StyledFileList>
          <ActivityList>
            {files.map((file: WorkflowFile) => (
              <WorkflowAttachmentRow
                key={file.id}
                file={file}
                onRemove={() => handleRemoveFile(file.id)}
                readonly={readonly}
              />
            ))}
          </ActivityList>
        </StyledFileList>
      )}

      {!readonly && (
        <>
          <StyledFileInput
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button
            Icon={IconPlus}
            title={t`Add File`}
            size="small"
            variant="secondary"
            onClick={handleAddFileClick}
            disabled={isUploading}
          />
        </>
      )}
    </StyledContainer>
  );
};
