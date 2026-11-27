import { createHash } from 'node:crypto';

const MINUTE_MS = 60_000;

export const computeCronTriggerSpreadOffsetMs = ({
  workspaceId,
  logicFunctionUniversalIdentifier,
  spreadMs,
}: {
  workspaceId: string;
  logicFunctionUniversalIdentifier: string;
  spreadMs: number;
}): number => {
  const hash = createHash('sha256')
    .update(`${workspaceId}:${logicFunctionUniversalIdentifier}`)
    .digest()
    .readUIntBE(0, 6);

  return Math.floor((hash % spreadMs) / MINUTE_MS) * MINUTE_MS;
};
