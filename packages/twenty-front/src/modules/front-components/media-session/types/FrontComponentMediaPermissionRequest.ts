import { type ApplicationCapability } from 'twenty-shared/application';

export type FrontComponentMediaPermissionRequest = {
  capabilities: ApplicationCapability[];
  abortSignal: AbortSignal;
  resolve: (grantedCapabilities: string[] | null) => void;
};
