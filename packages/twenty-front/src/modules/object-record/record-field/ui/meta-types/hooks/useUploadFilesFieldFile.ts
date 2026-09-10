import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/feedback';
import { FileFolder } from '~/generated-metadata/graphql';

const DEFAULT_VALUE_BEFORE_SERVER_RESPONSE =
  'default-value-before-server-response';

export const useUploadFilesFieldFile = () => {
  const { uploadFile: directUploadFile } = useDirectFileUpload();
  const { enqueueToast } = useToast();
  const { t } = useLingui();

  const uploadFile = async (file: File, fieldMetadataId: string) => {
    try {
      const uploadedFile = await directUploadFile(file, {
        fileFolder: FileFolder.FilesField,
        fieldMetadataId,
      });

      const fileName = file.name;
      enqueueToast({
        variant: 'success',
        children: t`File "${fileName}" uploaded successfully`,
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
      enqueueToast({
        variant: 'error',
        children: t`Failed to upload "${fileNameForError}"`,
      });

      throw new Error(
        t`Failed to upload file "${fileNameForError}": ${errorMessage}`,
      );
    }
  };

  return { uploadFile };
};
