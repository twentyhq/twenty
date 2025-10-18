import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
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

      enqueueSuccessSnackBar({
        message: `File "${file.name}" uploaded successfully`,
      });

      return workflowFile;
    } catch (error) {
      logError(`Failed to upload workflow file "${file.name}": ${error}`);

      enqueueErrorSnackBar({
        message: `Failed to upload "${file.name}"`,
      });

      return null;
    }
  };

  return { uploadWorkflowFile };
};
