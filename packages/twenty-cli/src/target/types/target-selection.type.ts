import { type RemoteEntry } from '@/config/types/config-file.type';

export type TargetSelection =
  | { source: 'environment'; apiUrl: string; apiKey: string }
  | { source: 'remote'; remoteName: string; remote: RemoteEntry };
