import { MAX_ATTACHMENT_SIZE } from '@/advanced-text-editor/utils/maxAttachmentSize';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { formatFileSize } from '@/file/utils/formatFileSize';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { extractFolderPathFilenameAndTypeOrThrow } from 'twenty-shared/utils';
import { type WorkflowAttachment } from 'twenty-shared/workflow';
import { FileFolder } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const useUploadWorkflowFile = () => {
  const { uploadFile: directUploadFile } = useDirectFileUpload();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const uploadWorkflowFile = async (
    file: File,
  ): Promise<WorkflowAttachment | null> => {
    try {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        const fileName = file.name;
        const maxUploadSize = formatFileSize(MAX_ATTACHMENT_SIZE);
        enqueueErrorSnackBar({
          message: t`File "${fileName}" exceeds ${maxUploadSize}`,
        });
        return null;
      }

      const uploadedFile = await directUploadFile(file, {
        fileFolder: FileFolder.Workflow,
      });
      const workflowFile: WorkflowAttachment = {
        id: uploadedFile.id,
        name: file.name,
        size: uploadedFile.size,
        type: extractFolderPathFilenameAndTypeOrThrow(uploadedFile.path).type,
        createdAt: uploadedFile.createdAt,
      };

      const fileName = file.name;
      enqueueSuccessSnackBar({
        message: t`File "${fileName}" uploaded successfully`,
      });

      return workflowFile;
    } catch (error) {
      logError(`Failed to upload workflow file "${file.name}": ${error}`);

      const fileNameForError = file.name;
      enqueueErrorSnackBar({
        message: t`Failed to upload "${fileNameForError}"`,
      });

      return null;
    }
  };

  return { uploadWorkflowFile };
};
