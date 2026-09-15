import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { FileFolder } from '~/generated-metadata/graphql';

const DEFAULT_VALUE_BEFORE_SERVER_RESPONSE =
  'default-value-before-server-response';

export const useUploadFilesFieldFile = () => {
  const { uploadFile: directUploadFile } = useDirectFileUpload();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const uploadFile = async (file: File, fieldMetadataId: string) => {
    try {
      const uploadedFile = await directUploadFile(file, {
        fileFolder: FileFolder.FilesField,
        fieldMetadataId,
      });

      const fileName = file.name;
      enqueueSuccessSnackBar({
        message: t`File "${fileName}" uploaded successfully`,
      });

      return {
        fileId: uploadedFile.id,
        label: file.name,
        extension: DEFAULT_VALUE_BEFORE_SERVER_RESPONSE,
        url: DEFAULT_VALUE_BEFORE_SERVER_RESPONSE,
      };
    } catch (error) {
      const fileNameForError = file.name;
      const errorMessage = String(error);
      enqueueErrorSnackBar({
        message: t`Failed to upload "${fileNameForError}"`,
      });

      throw new Error(
        t`Failed to upload file "${fileNameForError}": ${errorMessage}`,
      );
    }
  };

  return { uploadFile };
};
