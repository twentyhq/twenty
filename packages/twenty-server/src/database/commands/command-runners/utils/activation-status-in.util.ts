import { type WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Raw } from 'typeorm';

// TODO: drop the ::text cast and use In() once upgrades from versions before 2.22 (CREATED enum migration) are no longer supported
export const activationStatusIn = (statuses: WorkspaceActivationStatus[]) =>
  Raw(
    (alias) => {
      const quotedAlias = alias
        .split('.')
        .map((aliasPart) => `"${aliasPart.replace(/"/g, '')}"`)
        .join('.');

      return `${quotedAlias}::text IN (:...activationStatusValues)`;
    },
    {
      activationStatusValues: statuses,
    },
  );
