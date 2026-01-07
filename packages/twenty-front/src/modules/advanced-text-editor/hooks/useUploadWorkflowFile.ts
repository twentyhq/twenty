import { MAX_ATTACHMENT_SIZE } from '@/advanced-text-editor/utils/MaxAttachmentSize';
import { formatFileSize } from '@/file/utils/formatFileSize';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useCreateFileMutation } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

type WorkflowFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
};

export const useUploadWorkflowFile = () => {
  const coreClient = useApolloCoreClient();
  const [createFile] = useCreateFileMutation({ client: coreClient });
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const uploadWorkflowFile = async (
    file: File,
  ): Promise<WorkflowFile | null> => {
    try {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        const fileName = file.name;
        const maxUploadSize = formatFileSize(MAX_ATTACHMENT_SIZE);
        enqueueErrorSnackBar({
          message: t`File "${fileName}" exceeds ${maxUploadSize}`,
        });
        return null;
      }

      const result = await createFile({
        variables: { file },
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
