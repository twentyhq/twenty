import { MAX_ATTACHMENT_SIZE } from '@/advanced-text-editor/utils/MaxAttachmentSize';
import { formatFileSize } from '@/file/utils/formatFileSize';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useApolloClient } from '@apollo/client';
import { t } from '@lingui/core/macro';
import {
  extractFolderPathFilenameAndTypeOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { type WorkflowAttachment } from 'twenty-shared/workflow';
import {
  FeatureFlagKey,
  useCreateFileMutation,
  useUploadWorkflowFileMutation,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const useUploadWorkflowFile = () => {
  const isOtherFileMigrated = useIsFeatureEnabled(
    FeatureFlagKey.IS_OTHER_FILE_MIGRATED,
  );
  const [uploadWorkflowFileMutation] = useUploadWorkflowFileMutation();
  const apolloClient = useApolloClient();
  const [createFile] = useCreateFileMutation({ client: apolloClient });
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

      let workflowFile: WorkflowAttachment;
      if (isOtherFileMigrated) {
        const result = await uploadWorkflowFileMutation({
          variables: { file },
        });
        const uploadedFile = result?.data?.uploadWorkflowFile;
        if (!isDefined(uploadedFile)) {
          throw new Error('File upload failed');
        }
        workflowFile = {
          id: uploadedFile.id,
          name: file.name,
          size: uploadedFile.size,
          type: extractFolderPathFilenameAndTypeOrThrow(uploadedFile.path).type,
          createdAt: uploadedFile.createdAt,
        };
      } else {
        const result = await createFile({
          variables: { file },
        });

        const uploadedFile = result?.data?.createFile;

        if (!isDefined(uploadedFile)) {
          throw new Error('File upload failed');
        }

        workflowFile = {
          id: uploadedFile.id,
          name: file.name,
          size: uploadedFile.size,
          type: extractFolderPathFilenameAndTypeOrThrow(uploadedFile.path).type,
          createdAt: uploadedFile.createdAt,
        };
      }

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
