import { type TypedDocumentNode } from '@apollo/client';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { putFileToUploadTarget } from '@/file/utils/putFileToUploadTarget';
import { useRequestApplicationTokenRefresh } from '@/front-components/hooks/useRequestApplicationTokenRefresh';
import { frontComponentApplicationTokenPairComponentState } from '@/front-components/states/frontComponentApplicationTokenPairComponentState';
import { postMetadataGraphqlOperationWithApplicationAccessToken } from '@/front-components/utils/postMetadataGraphqlOperationWithApplicationAccessToken';
import { sendMetadataGraphqlOperationWithOneRetryOnUnauthenticated } from '@/front-components/utils/sendMetadataGraphqlOperationWithOneRetryOnUnauthenticated';
import { unwrapMetadataGraphqlResponseOrThrow } from '@/front-components/utils/unwrapMetadataGraphqlResponseOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import {
  CompleteFileUploadDocument,
  CreateFileUploadDocument,
  FileFolder,
  type FileWithSignedUrl,
} from '~/generated-metadata/graphql';

type UseFrontComponentFileUploadArgs = {
  frontComponentId: string;
};

export const useFrontComponentFileUpload = ({
  frontComponentId,
}: UseFrontComponentFileUploadArgs) => {
  const store = useStore();
  const applicationTokenPairAtom = useAtomComponentStateCallbackState(
    frontComponentApplicationTokenPairComponentState,
    frontComponentId,
  );
  const { requestAccessTokenRefresh } = useRequestApplicationTokenRefresh({
    frontComponentId,
  });

  const executeAsApplication = async <
    TData,
    TVariables extends Record<string, unknown>,
  >({
    document,
    variables,
  }: {
    document: TypedDocumentNode<TData, TVariables>;
    variables: TVariables;
  }): Promise<TData> => {
    const applicationTokenPair = store.get(applicationTokenPairAtom);

    if (!isDefined(applicationTokenPair)) {
      throw new Error(
        'Application token pair must be initialized before uploading a file',
      );
    }

    const response =
      await sendMetadataGraphqlOperationWithOneRetryOnUnauthenticated({
        applicationAccessToken:
          applicationTokenPair.applicationAccessToken.token,
        requestAccessTokenRefresh,
        sendOperation: (applicationAccessToken) =>
          postMetadataGraphqlOperationWithApplicationAccessToken({
            document,
            variables,
            applicationAccessToken,
          }),
      });

    return unwrapMetadataGraphqlResponseOrThrow(response);
  };

  const uploadFileToFilesField = async (
    file: File,
    { fieldMetadataId }: { fieldMetadataId: string },
  ): Promise<FileWithSignedUrl> => {
    const { createFileUpload: uploadTarget } = await executeAsApplication({
      document: CreateFileUploadDocument,
      variables: {
        filename: file.name,
        size: file.size,
        fileFolder: FileFolder.FilesField,
        fieldMetadataId,
      },
    });

    await putFileToUploadTarget({ file, uploadTarget });

    const { completeFileUpload: uploadedFile } = await executeAsApplication({
      document: CompleteFileUploadDocument,
      variables: { fileId: uploadTarget.fileId },
    });

    return uploadedFile;
  };

  return { uploadFileToFilesField };
};
