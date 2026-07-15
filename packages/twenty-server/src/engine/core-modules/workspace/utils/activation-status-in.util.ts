import { type WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Raw } from 'typeorm';

// TODO: drop the ::text cast and use In() once the CREATED enum migration has run everywhere (follow-up PR of #22904)
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
