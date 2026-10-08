import { createHash } from 'node:crypto';

export const getGranolaJobId = ({
  prefix,
  identity,
}: {
  prefix:
    | 'granola-daily-catch-up'
    | 'granola-discovery'
    | 'granola-note'
    | 'granola-webhook-note';
  identity: Record<string, unknown>;
}): string =>
  `${prefix}-${createHash('sha256').update(JSON.stringify(identity)).digest('hex').slice(0, 32)}`;
