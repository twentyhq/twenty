import { type Logger } from '@nestjs/common';

export const validateStandardMetadataUpdateCount = ({
  actualCount,
  expectedCount,
  logger,
  metadataLabel,
  workspaceId,
}: {
  actualCount: number;
  expectedCount: number;
  logger: Pick<Logger, 'warn'>;
  metadataLabel: string;
  workspaceId: string;
}): void => {
  if (actualCount > expectedCount) {
    throw new Error(
      `Expected at most ${expectedCount} ${metadataLabel} for workspace ${workspaceId}, updated ${actualCount}`,
    );
  }

  if (actualCount < expectedCount) {
    logger.warn(
      `Expected ${expectedCount} ${metadataLabel} for workspace ${workspaceId}, updated ${actualCount}; continuing because standard metadata can be absent on older workspaces`,
    );
  }
};
