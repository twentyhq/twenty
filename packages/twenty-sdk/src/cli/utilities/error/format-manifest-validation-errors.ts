import { isNonEmptyString } from '@sniptt/guards';
import {
  type AllMetadataName,
  type MetadataValidationErrorResponse,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type OrchestratorStateStepEvent } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';

export const formatManifestValidationErrors = (
  error: MetadataValidationErrorResponse | undefined,
): OrchestratorStateStepEvent[] | null => {
  if (!isDefined(error?.errors) || !isDefined(error?.summary)) {
    return null;
  }

  const events: OrchestratorStateStepEvent[] = [];
  const totalErrors = error.summary.totalErrors;

  events.push({
    message: `Sync failed with ${totalErrors} error${totalErrors !== 1 ? 's' : ''}`,
    status: 'error',
  });

  for (const [metadataName, entries] of Object.entries(error.errors)) {
    if (!isDefined(entries)) {
      continue;
    }

    const count =
      error.summary[metadataName as AllMetadataName] ?? entries.length;

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

        if (isDefined(entryError.value)) {
          details.push(`value: ${String(entryError.value)}`);
        }

        if (isNonEmptyString(universalIdentifier)) {
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
