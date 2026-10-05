import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { type ApplicationVariableFileValue } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { CompleteAdminApplicationRegistrationVariableFileUploadDocument } from '~/generated-admin/graphql';
import {
  CompleteApplicationRegistrationVariableFileUploadDocument,
  FileFolder,
} from '~/generated-metadata/graphql';
import { toApplicationVariableFileValue } from '~/pages/settings/applications/utils/toApplicationVariableFileValue';

// The upload lands in the current workspace, then the completion moves it to
// the registration, which is instance-level
export const useUploadApplicationRegistrationVariableFile = ({
  applicationRegistrationId,
  fromAdmin,
}: {
  applicationRegistrationId: string;
  fromAdmin?: boolean;
}) => {
  const { createFileUploadAndPutFile } = useDirectFileUpload();
  const apolloAdminClient = useApolloAdminClient();

  const [completeWorkspaceUpload] = useMutation(
    CompleteApplicationRegistrationVariableFileUploadDocument,
  );
  const [completeAdminUpload] = useMutation(
    CompleteAdminApplicationRegistrationVariableFileUploadDocument,
    { client: apolloAdminClient },
  );

  const completeUpload = async (fileId: string) => {
    if (fromAdmin === true) {
      const { data } = await completeAdminUpload({
        variables: { applicationRegistrationId, fileId },
      });

      return data?.completeAdminApplicationRegistrationVariableFileUpload;
    }

    const { data } = await completeWorkspaceUpload({
      variables: { applicationRegistrationId, fileId },
    });

    return data?.completeApplicationRegistrationVariableFileUpload;
  };

  const uploadApplicationRegistrationVariableFile = async (
    file: File,
  ): Promise<ApplicationVariableFileValue> => {
    const { fileId } = await createFileUploadAndPutFile(file, {
      fileFolder: FileFolder.ApplicationRegistrationVariableUpload,
    });

    const uploadedFile = await completeUpload(fileId);

    if (!isDefined(uploadedFile)) {
      throw new Error(t`Failed to finalize file upload`);
    }

    return toApplicationVariableFileValue({ file, uploadedFile });
  };

  return { uploadApplicationRegistrationVariableFile };
};
