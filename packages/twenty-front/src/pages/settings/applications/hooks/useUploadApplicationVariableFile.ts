import { type ApplicationVariableFileValue } from 'twenty-shared/application';

import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { FileFolder } from '~/generated-metadata/graphql';
import { toApplicationVariableFileValue } from '~/pages/settings/applications/utils/toApplicationVariableFileValue';

// Files are stored under the application owning the variable
export const useUploadApplicationVariableFile = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const { uploadFile } = useDirectFileUpload();

  const uploadApplicationVariableFile = async (
    file: File,
  ): Promise<ApplicationVariableFileValue> => {
    const uploadedFile = await uploadFile(file, {
      fileFolder: FileFolder.ApplicationVariable,
      applicationId,
    });

    return toApplicationVariableFileValue({ file, uploadedFile });
  };

  return { uploadApplicationVariableFile };
};
