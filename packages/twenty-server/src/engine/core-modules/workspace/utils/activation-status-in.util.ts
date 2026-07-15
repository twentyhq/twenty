import { type WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Raw } from 'typeorm';

// ::text comparison keeps the filter valid on databases where an enum value migration has not run yet
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
