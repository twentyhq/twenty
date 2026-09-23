import { type DocumentNode } from 'graphql';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { useFrontComponentApplicationTokenPair } from '@/front-components/hooks/useFrontComponentApplicationTokenPair';
import { frontComponentApplicationTokenPairFamilyState } from '@/front-components/states/frontComponentApplicationTokenPairFamilyState';
import { isUnauthenticatedMetadataGraphqlResponse } from '@/front-components/utils/isUnauthenticatedMetadataGraphqlResponse';
import { postMetadataGraphqlOperationWithApplicationAccessToken } from '@/front-components/utils/postMetadataGraphqlOperationWithApplicationAccessToken';
import { unwrapMetadataGraphqlResponseOrThrow } from '@/front-components/utils/unwrapMetadataGraphqlResponseOrThrow';
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
  applicationId: string;
};

// Runs with the component's application token on purpose: the user session
// would let a component upload with permissions its application never had.
export const useFrontComponentFileUpload = ({
  applicationId,
}: UseFrontComponentFileUploadArgs) => {
  const store = useStore();
  const { requestApplicationAccessTokenRefresh } =
    useFrontComponentApplicationTokenPair();

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
    const applicationTokenPair = store.get(
      frontComponentApplicationTokenPairFamilyState.atomFamily(applicationId),
    );

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

    const refreshedApplicationAccessToken =
      await requestApplicationAccessTokenRefresh(applicationId);

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
