import { createHash } from 'node:crypto';

export const getGranolaJobId = ({
  prefix,
  identity,
}: {
  prefix: 'granola-discovery' | 'granola-note' | 'granola-personal-reconcile';
  identity: Record<string, unknown>;
}): string =>
  `${prefix}-${createHash('sha256').update(JSON.stringify(identity)).digest('hex').slice(0, 32)}`;
