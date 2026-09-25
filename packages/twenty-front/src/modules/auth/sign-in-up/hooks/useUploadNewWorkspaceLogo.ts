import { putFileToUploadTarget } from '@/file/utils/putFileToUploadTarget';
import { t } from '@lingui/core/macro';
import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  CompleteNewWorkspaceLogoUploadDocument,
  CreateNewWorkspaceLogoUploadDocument,
  type FileWithSignedUrl,
} from '~/generated-metadata/graphql';

export const useUploadNewWorkspaceLogo = () => {
  const [createNewWorkspaceLogoUpload] = useMutation(
    CreateNewWorkspaceLogoUploadDocument,
  );
  const [completeNewWorkspaceLogoUpload] = useMutation(
    CompleteNewWorkspaceLogoUploadDocument,
  );

  const uploadNewWorkspaceLogo = async ({
    workspaceId,
    file,
  }: {
    workspaceId: string;
    file: File;
  }): Promise<FileWithSignedUrl> => {
    const createResult = await createNewWorkspaceLogoUpload({
      variables: { workspaceId, filename: file.name, size: file.size },
    });

    const uploadTarget = createResult?.data?.createNewWorkspaceLogoUpload;

    if (!isDefined(uploadTarget)) {
      throw new Error(t`Failed to initiate logo upload`);
    }

    await putFileToUploadTarget({ file, uploadTarget });

    const completeResult = await completeNewWorkspaceLogoUpload({
      variables: { workspaceId, fileId: uploadTarget.fileId },
    });

    const uploadedLogo = completeResult?.data?.completeNewWorkspaceLogoUpload;

    if (!isDefined(uploadedLogo)) {
      throw new Error(t`Failed to finalize logo upload`);
    }

    return uploadedLogo;
  };

  return { uploadNewWorkspaceLogo };
};
