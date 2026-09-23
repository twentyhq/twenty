import { type TypedDocumentNode } from '@apollo/client';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { uploadFileThroughUploadTarget } from '@/file/utils/uploadFileThroughUploadTarget';
import { useRequestApplicationTokenRefresh } from '@/front-components/hooks/useRequestApplicationTokenRefresh';
import { frontComponentApplicationTokenPairComponentState } from '@/front-components/states/frontComponentApplicationTokenPairComponentState';
import { isUnauthenticatedMetadataGraphqlResponse } from '@/front-components/utils/isUnauthenticatedMetadataGraphqlResponse';
import { postMetadataGraphqlOperationWithApplicationAccessToken } from '@/front-components/utils/postMetadataGraphqlOperationWithApplicationAccessToken';
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
      await postMetadataGraphqlOperationWithApplicationAccessToken({
        document,
        variables,
        applicationAccessToken:
          applicationTokenPair.applicationAccessToken.token,
      });

    if (!isUnauthenticatedMetadataGraphqlResponse(response)) {
      return unwrapMetadataGraphqlResponseOrThrow(response);
    }

    return unwrapMetadataGraphqlResponseOrThrow(
      await postMetadataGraphqlOperationWithApplicationAccessToken({
        document,
        variables,
        applicationAccessToken: await requestAccessTokenRefresh(),
      }),
    );
  };

  const uploadFileToFilesField = (
    file: File,
    { fieldMetadataId }: { fieldMetadataId: string },
  ): Promise<FileWithSignedUrl> =>
    uploadFileThroughUploadTarget({
      file,
      createFileUpload: async () => {
        const { createFileUpload } = await executeAsApplication({
          document: CreateFileUploadDocument,
          variables: {
            filename: file.name,
            size: file.size,
            fileFolder: FileFolder.FilesField,
            fieldMetadataId,
          },
        });

        return createFileUpload;
      },
      completeFileUpload: async (fileId) => {
        const { completeFileUpload } = await executeAsApplication({
          document: CompleteFileUploadDocument,
          variables: { fileId },
        });

        return completeFileUpload;
      },
    });

  return { uploadFileToFilesField };
};
