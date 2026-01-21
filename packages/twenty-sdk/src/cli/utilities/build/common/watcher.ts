import { type ApplicationManifest } from 'twenty-shared/application';


export interface RestartableWatcher {
  restart(manifest: ApplicationManifest): Promise<void>;
  start(): Promise<void>;
  close(): Promise<void>;
  shouldRestart(
    oldManifest: ApplicationManifest | null,
    newManifest: ApplicationManifest,
  ): boolean;
}

export type RestartableWatcherOptions = {
  appPath: string;
  manifest: ApplicationManifest | null;
};
