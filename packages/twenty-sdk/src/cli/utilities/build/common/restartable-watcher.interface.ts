import { type ApiService } from '@/cli/utilities/api/services/api.service';
import { type FileFolder } from 'twenty-shared/types';

export interface RestartableWatcher {
  restart(sourcePaths: string[]): Promise<void>;
  start(): Promise<void>;
  close(): Promise<void>;
  shouldRestart(sourcePaths: string[]): boolean;
}

export type OnFileBuiltCallback = (
  builtPath: string,
  checksum: string,
) => void | Promise<void>;

export type OnFileUploadedCallback = (
  builtPath: string,
  success: boolean,
) => void | Promise<void>;

export type UploadConfig = {
  appPath: string;
  apiService: ApiService;
  applicationUniversalIdentifier: string;
  fileFolder: FileFolder;
  onFileUploaded?: OnFileUploadedCallback;
  onUploadSuccess?: (builtPath: string) => void;
  onUploadError?: (builtPath: string, error: unknown) => void;
};

export type RestartableWatcherOptions = {
  appPath: string;
  sourcePaths: string[];
  watch?: boolean;
  onFileBuilt?: OnFileBuiltCallback;
  uploadConfig?: UploadConfig;
};
