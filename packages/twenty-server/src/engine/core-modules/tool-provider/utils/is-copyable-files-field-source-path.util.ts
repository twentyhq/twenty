import { FILES_FIELD_COPYABLE_SOURCE_FOLDERS } from 'src/engine/core-modules/tool-provider/constants/files-field-copyable-source-folders.constant';

export const isCopyableFilesFieldSourcePath = (path: string): boolean =>
  FILES_FIELD_COPYABLE_SOURCE_FOLDERS.some((folder) =>
    path.startsWith(`${folder}/`),
  );
