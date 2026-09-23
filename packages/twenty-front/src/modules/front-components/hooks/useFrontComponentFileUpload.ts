import { type TypedDocumentNode } from '@apollo/client';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { putFileToUploadTarget } from '@/file/utils/putFileToUploadTarget';
import { useFrontComponentApplicationTokenPair } from '@/front-components/hooks/useFrontComponentApplicationTokenPair';
import { frontComponentApplicationTokenPairFamilyState } from '@/front-components/states/frontComponentApplicationTokenPairFamilyState';
import { isUnauthenticatedMetadataGraphqlResponse } from '@/front-components/utils/isUnauthenticatedMetadataGraphqlResponse';
import { postMetadataGraphqlOperationWithApplicationAccessToken } from '@/front-components/utils/postMetadataGraphqlOperationWithApplicationAccessToken';
import { unwrapMetadataGraphqlResponseOrThrow } from '@/front-components/utils/unwrapMetadataGraphqlResponseOrThrow';
import {
  CompleteFileUploadDocument,
  CreateFileUploadDocument,
  FileFolder,
  type FileWithSignedUrl,
} from '~/generated-metadata/graphql';

type UseFrontComponentFileUploadArgs = {
  applicationId: string;
};

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
    document: TypedDocumentNode<TData, TVariables>;
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
        applicationAccessToken:
          await requestApplicationAccessTokenRefresh(applicationId),
      }),
    );
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
