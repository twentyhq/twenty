import { type OrchestratorStateStepEvent } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';

type SyncValidationEntry = {
  flatEntityMinimalInformation?: { universalIdentifier?: string };
  errors: { code: string; message: string; value?: string }[];
};

type StructuredSyncError = {
  message?: string;
  extensions?: {
    code?: string;
    errors?: Record<string, SyncValidationEntry[]>;
    summary?: Record<string, number> & { totalErrors: number };
    message?: string;
  };
};

export const formatManifestValidationErrors = (
  error: unknown,
): OrchestratorStateStepEvent[] | null => {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const syncError = error as StructuredSyncError;
  const extensions = syncError.extensions;

  if (!extensions?.errors || !extensions?.summary) {
    return null;
  }

  const events: OrchestratorStateStepEvent[] = [];
  const totalErrors = extensions.summary.totalErrors;

  events.push({
    message: `Sync failed with ${totalErrors} error${totalErrors !== 1 ? 's' : ''}`,
    status: 'error',
  });

  for (const [metadataName, entries] of Object.entries(extensions.errors)) {
    const count = extensions.summary[metadataName] ?? entries.length;

    events.push({
      message: `${metadataName}: ${count} error${count !== 1 ? 's' : ''}`,
      status: 'error',
    });

    let errorIndex = 1;

    for (const entry of entries) {
      const universalIdentifier =
        entry.flatEntityMinimalInformation?.universalIdentifier;

      for (const entryError of entry.errors) {
        const details: string[] = [];

        if (entryError.value) {
          details.push(`value: ${entryError.value}`);
        }

        if (universalIdentifier) {
          details.push(`universalIdentifier: ${universalIdentifier}`);
        }

        const suffix = details.length > 0 ? ` (${details.join(', ')})` : '';

        events.push({
          message: `  ${errorIndex}. ${entryError.code}: ${entryError.message}${suffix}`,
          status: 'error',
        });
        errorIndex++;
      }
    }
  }

  return events;
};
