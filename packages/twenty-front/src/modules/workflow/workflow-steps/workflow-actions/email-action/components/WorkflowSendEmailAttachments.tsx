import { ActivityList } from '@/activities/components/ActivityList';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { WorkflowAttachmentRow } from '@/workflow/workflow-steps/workflow-actions/email-action/components/WorkflowAttachmentRow';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useCreateFileMutation } from '~/generated-metadata/graphql';

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
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const coreClient = useApolloCoreClient();
  const [createFile] = useCreateFileMutation({ client: coreClient });

  const { t } = useLingui();

  const handleAddFileClick = () => {
    fileInputRef.current?.click();
  };

  const onUploadFile = async (file: File): Promise<WorkflowFile | null> => {
    try {
      const result = await createFile({
        variables: {
          file,
        },
      });

      const uploadedFile = result?.data?.createFile;

      if (!isDefined(uploadedFile)) {
        throw new Error('File upload failed');
      }

      const workflowFile: WorkflowFile = {
        id: uploadedFile.id,
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type,
        createdAt: uploadedFile.createdAt,
      };

      enqueueSuccessSnackBar({
        message: `File "${file.name}" uploaded successfully`,
      });

      return workflowFile;
    } catch (error) {
      enqueueErrorSnackBar({
        message: `Failed to upload "${file.name}"`,
      });
      return null;
    }
  };

  const onUploadFiles = async (filesToUpload: File[]) => {
    setIsUploading(true);
    try {
      const uploadedFiles: WorkflowFile[] = [];

      for (const file of filesToUpload) {
        const uploadedFile = await onUploadFile(file);
        if (uploadedFile) {
          uploadedFiles.push(uploadedFile);
        }
      }

      if (uploadedFiles.length > 0) {
        onChange([...files, ...uploadedFiles]);
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
    if (fileInputRef.current) {
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
