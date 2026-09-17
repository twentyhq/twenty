import { createHash } from 'node:crypto';

import { type ReadablePerson } from 'src/logic-functions/data/fetch-readable-people.util';

export const buildExportJobId = ({
  connectionId,
  people,
}: {
  connectionId: string;
  people: ReadablePerson[];
}): string =>
  `export-contacts-${createHash('sha256')
    .update(
      JSON.stringify([
        connectionId,
        [...people]
          .sort((first, second) => first.id.localeCompare(second.id))
          .map(({ id, updatedAt }) => [id, updatedAt ?? null]),
      ]),
    )
    .digest('hex')
    .slice(0, 32)}`;
