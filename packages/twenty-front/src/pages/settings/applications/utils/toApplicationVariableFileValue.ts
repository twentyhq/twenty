import { type ApplicationVariableFileValue } from 'twenty-shared/application';
import { type FileWithSignedUrl } from '~/generated-metadata/graphql';

const getFileExtension = (path: string): string | undefined => {
  const extensionStart = path.lastIndexOf('.');

  return extensionStart === -1 ? undefined : path.slice(extensionStart);
};

export const toApplicationVariableFileValue = ({
  file,
  uploadedFile,
}: {
  file: File;
  uploadedFile: Pick<FileWithSignedUrl, 'id' | 'path' | 'url'>;
}): ApplicationVariableFileValue => ({
  fileId: uploadedFile.id,
  label: file.name,
  extension: getFileExtension(uploadedFile.path),
  url: uploadedFile.url,
});
