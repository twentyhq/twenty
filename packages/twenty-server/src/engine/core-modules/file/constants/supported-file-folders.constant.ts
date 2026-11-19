import { FileFolder } from 'twenty-shared/types';

export const SUPPORTED_FILE_FOLDERS = [
  FileFolder.CorePicture,
  FileFolder.FilesField,
  FileFolder.Workflow,
  FileFolder.AgentChat,
  FileFolder.EmailAttachment,
  FileFolder.EmailImage,
  FileFolder.AppTarball,
  FileFolder.Dpa,
  FileFolder.WorkspaceDataExport,
] as const;
