import { type DocumentNode } from 'graphql';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { useRequestApplicationTokenRefresh } from '@/front-components/hooks/useRequestApplicationTokenRefresh';
import { frontComponentApplicationTokenPairComponentState } from '@/front-components/states/frontComponentApplicationTokenPairComponentState';
import { isUnauthenticatedMetadataGraphqlResponse } from '@/front-components/utils/isUnauthenticatedMetadataGraphqlResponse';
import { postMetadataGraphqlOperationWithApplicationAccessToken } from '@/front-components/utils/postMetadataGraphqlOperationWithApplicationAccessToken';
import { unwrapMetadataGraphqlResponseOrThrow } from '@/front-components/utils/unwrapMetadataGraphqlResponseOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import {
  CompleteFileUploadDocument,
  type CompleteFileUploadMutation,
  type CompleteFileUploadMutationVariables,
  CreateFileUploadDocument,
  type CreateFileUploadMutation,
  type CreateFileUploadMutationVariables,
  FileFolder,
  type FileWithSignedUrl,
} from '~/generated-metadata/graphql';

type UseFrontComponentFileUploadArgs = {
  frontComponentId: string;
};

// Runs with the component's application token on purpose: the user session
// would let a component upload with permissions its application never had.
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
    document: DocumentNode;
    variables: TVariables;
  }): Promise<TData> => {
    const applicationTokenPair = store.get(applicationTokenPairAtom);

    if (!isDefined(applicationTokenPair)) {
      throw new Error(
        'Application token pair must be initialized before uploading a file',
      );
    }

    const response =
      await postMetadataGraphqlOperationWithApplicationAccessToken<
        TData,
        TVariables
      >({
        document,
        variables,
        applicationAccessToken:
          applicationTokenPair.applicationAccessToken.token,
      });

    if (!isUnauthenticatedMetadataGraphqlResponse(response)) {
      return unwrapMetadataGraphqlResponseOrThrow(response);
    }

    const refreshedApplicationAccessToken = await requestAccessTokenRefresh();

    return unwrapMetadataGraphqlResponseOrThrow(
      await postMetadataGraphqlOperationWithApplicationAccessToken<
        TData,
        TVariables
      >({
        document,
        variables,
        applicationAccessToken: refreshedApplicationAccessToken,
      }),
    );
  };

  const uploadFileToFilesField = async (
    file: File,
    { fieldMetadataId }: { fieldMetadataId: string },
  ): Promise<FileWithSignedUrl> => {
    const { createFileUpload: uploadTarget } = await executeAsApplication<
      CreateFileUploadMutation,
      CreateFileUploadMutationVariables
    >({
      document: CreateFileUploadDocument,
      variables: {
        filename: file.name,
        size: file.size,
        fileFolder: FileFolder.FilesField,
        fieldMetadataId,
      },
    });

    const putResponse = await fetch(uploadTarget.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': uploadTarget.contentType },
      body: file,
      credentials: 'omit',
    });

    if (!putResponse.ok) {
      throw new Error(`File upload failed with status ${putResponse.status}`);
    }

    const { completeFileUpload: uploadedFile } = await executeAsApplication<
      CompleteFileUploadMutation,
      CompleteFileUploadMutationVariables
    >({
      document: CompleteFileUploadDocument,
      variables: { fileId: uploadTarget.fileId },
    });

    return uploadedFile;
  };

  return { uploadFileToFilesField };
};
