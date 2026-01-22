import { type ApiService } from '@/cli/utilities/api/services/api.service';

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
  apiService: ApiService;
  applicationUniversalIdentifier: string;
};

export type RestartableWatcherOptions = {
  appPath: string;
  sourcePaths: string[];
  watch?: boolean;
  onFileBuilt?: OnFileBuiltCallback;
  uploadConfig?: UploadConfig;
  onFileUploaded?: OnFileUploadedCallback;
};
