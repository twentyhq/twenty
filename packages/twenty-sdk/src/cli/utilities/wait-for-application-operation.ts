import { type ApiService } from '@/cli/utilities/api/api-service';

const POLL_INTERVAL_MS = 2_000;
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1_000;

type ApplicationOperationOutcome =
  | { outcome: 'success' }
  | { outcome: 'failure'; message: string };

const sleep = (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

const pollApplicationState = async ({
  apiService,
  universalIdentifier,
  resolveOutcome,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: {
  apiService: ApiService;
  universalIdentifier: string;
  resolveOutcome: (
    state: string | null,
  ) => ApplicationOperationOutcome | undefined;
  timeoutMs?: number;
}): Promise<ApplicationOperationOutcome> => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const result =
      await apiService.findApplicationInstallState(universalIdentifier);

    if (!result.success) {
      return {
        outcome: 'failure',
        message: String(result.error ?? 'Failed to fetch application state'),
      };
    }

    const resolvedOutcome = resolveOutcome(result.data?.state ?? null);

    if (resolvedOutcome) {
      return resolvedOutcome;
    }

    await sleep(POLL_INTERVAL_MS);
  }

  return {
    outcome: 'failure',
    message: 'Timed out waiting for the application operation to complete',
  };
};

export const waitForApplicationInstallCompletion = ({
  apiService,
  universalIdentifier,
}: {
  apiService: ApiService;
  universalIdentifier: string;
}): Promise<ApplicationOperationOutcome> =>
  pollApplicationState({
    apiService,
    universalIdentifier,
    resolveOutcome: (state) => {
      if (state === 'INSTALLED') {
        return { outcome: 'success' };
      }

      // A fresh install that failed is rolled back and its row deleted.
      if (state === null) {
        return {
          outcome: 'failure',
          message:
            'Install failed server-side: the application was rolled back. Check the server logs for details.',
        };
      }

      return undefined;
    },
  });

export const waitForApplicationUninstallCompletion = ({
  apiService,
  universalIdentifier,
}: {
  apiService: ApiService;
  universalIdentifier: string;
}): Promise<ApplicationOperationOutcome> =>
  pollApplicationState({
    apiService,
    universalIdentifier,
    resolveOutcome: (state) => {
      if (state === null) {
        return { outcome: 'success' };
      }

      // A failed uninstall reverts the application to INSTALLED.
      if (state === 'INSTALLED') {
        return {
          outcome: 'failure',
          message:
            'Uninstall failed server-side: the application is still installed. Check the server logs for details.',
        };
      }

      return undefined;
    },
  });
