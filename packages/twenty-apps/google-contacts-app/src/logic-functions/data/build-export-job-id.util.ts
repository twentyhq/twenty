import { createHash } from 'node:crypto';

// Keyed on the selection itself: a resubmitted selection is deduplicated
// before the worker picks it up, while a different one still gets its own job.
export const buildExportJobId = ({
  connectionId,
  recordIds,
}: {
  connectionId: string;
  recordIds: string[];
}): string =>
  `export-contacts-${createHash('sha256')
    .update(JSON.stringify([connectionId, [...recordIds].sort()]))
    .digest('hex')
    .slice(0, 32)}`;
