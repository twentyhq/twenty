import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  buildSignedPath,
  getImageAbsoluteURI,
  isDefined,
} from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  FileFolder,
  useCreateFileMutation,
  useUploadFileMutation,
} from '~/generated-metadata/graphql';

export const useFileUpload = () => {
  const coreClient = useApolloCoreClient();
  const [uploadFile] = useUploadFileMutation({ client: coreClient });
  const [createFile] = useCreateFileMutation({ client: coreClient });

  const uploadFileAndCreateRecord = async (file: File) => {
    const result = await uploadFile({
      variables: {
        file,
        fileFolder: FileFolder.Attachment,
      },
    });

    const signedFile = result?.data?.uploadFile;

    if (!isDefined(signedFile)) {
      throw new Error("Couldn't upload the file.");
    }

    const signedPath = buildSignedPath(signedFile);
    const fullPath = getImageAbsoluteURI({
      imageUrl: signedPath,
      baseUrl: REACT_APP_SERVER_BASE_URL,
    });

    const createFileResult = await createFile({
      variables: {
        name: file.name,
        fullPath,
        size: file.size,
        type: file.type,
      },
    });

    const createdFile = createFileResult?.data?.createFile;

    if (!isDefined(createdFile)) {
      throw new Error("Couldn't create the file record.");
    }

    return createdFile;
  };

  return { uploadFileAndCreateRecord };
};
