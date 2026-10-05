import { type ApplicationVariableFileValue } from 'twenty-shared/application';
import { type FileWithSignedUrl } from '~/generated-metadata/graphql';
import { getFileNameAndExtension } from '~/utils/file/getFileNameAndExtension';

export const toApplicationVariableFileValue = ({
  file,
  uploadedFile,
}: {
  file: File;
  uploadedFile: Pick<FileWithSignedUrl, 'id' | 'path' | 'url'>;
}): ApplicationVariableFileValue => ({
  fileId: uploadedFile.id,
  label: file.name,
  extension: getFileNameAndExtension(uploadedFile.path).extension || undefined,
  url: uploadedFile.url,
});
