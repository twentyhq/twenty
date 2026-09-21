import { type FrontComponentMediaPermissionRequest } from '@/front-components/media-session/types/FrontComponentMediaPermissionRequest';
import { type ApplicationCapability } from 'twenty-shared/application';

export const waitForFrontComponentMediaPermission = ({
  capabilities,
  abortSignal,
  onRequestChange,
}: {
  capabilities: ApplicationCapability[];
  abortSignal: AbortSignal;
  onRequestChange: (
    request: FrontComponentMediaPermissionRequest | null,
  ) => void;
}): Promise<string[] | null> => {
  if (abortSignal.aborted) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    let isResolved = false;

    const resolveRequest = (grantedCapabilities: string[] | null) => {
      if (isResolved) {
        return;
      }

      isResolved = true;
      abortSignal.removeEventListener('abort', handleAbort);
      onRequestChange(null);
      resolve(grantedCapabilities);
    };

    const handleAbort = () => resolveRequest(null);

    abortSignal.addEventListener('abort', handleAbort, { once: true });
    onRequestChange({ capabilities, abortSignal, resolve: resolveRequest });
  });
};
