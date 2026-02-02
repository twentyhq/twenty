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

  const uploadFile = async (file: File) => {
    try {
      const result = await uploadFilesFieldFile({
        variables: { file },
      });

      const uploadedFile = result?.data?.uploadFilesFieldFile;

      if (!isDefined(uploadedFile)) {
        throw new Error('File upload failed');
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
      enqueueErrorSnackBar({
        message: t`Failed to upload "${fileNameForError}"`,
      });

      throw new Error(`Failed to upload file "${file.name}": ${error}`);
    }
  };

  return { uploadFile };
};
