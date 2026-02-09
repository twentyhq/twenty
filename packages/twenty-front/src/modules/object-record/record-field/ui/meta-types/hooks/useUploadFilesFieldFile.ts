import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useUploadFilesFieldFileMutation } from '~/generated-metadata/graphql';

const DEFAULT_VALUE_BEFORE_SERVER_RESPONSE =
  'default-value-before-server-response';

export const useUploadFilesFieldFile = () => {
  const coreClient = useApolloCoreClient();
  const [uploadFilesFieldFile] = useUploadFilesFieldFileMutation({
    client: coreClient,
  });
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const uploadFile = async (file: File, fieldMetadataId: string) => {
    try {
      const result = await uploadFilesFieldFile({
        variables: { file, fieldMetadataId },
      });

      const uploadedFile = result?.data?.uploadFilesFieldFile;

      if (!isDefined(uploadedFile)) {
        throw new Error(t`File upload failed`);
      }

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
