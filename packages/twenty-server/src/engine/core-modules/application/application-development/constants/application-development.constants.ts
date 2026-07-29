import { FileFolder } from 'twenty-shared/types';

export const APP_DEV_RATE_LIMIT_MAX = 30;
export const APP_DEV_RATE_LIMIT_WINDOW_MS = 30_000;

export const ALLOWED_APPLICATION_FILE_FOLDERS: FileFolder[] = [
  FileFolder.BuiltLogicFunction,
  FileFolder.BuiltFrontComponent,
  FileFolder.PublicAsset,
  FileFolder.Source,
  FileFolder.Dependencies,
];
