import { CustomError } from 'twenty-shared/utils';
import { QueryFailedError } from 'typeorm';

import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

const formatStack = (stack: string | undefined): string => {
  return (stack ?? '').split('\n').slice(1).join('\n');
};

const joinParts = (parts: (string | null)[]): string => {
  return parts.filter(Boolean).join('\n');
};

const buildErrorParts = (error: unknown): (string | null)[] => {
  if (error instanceof QueryFailedError) {
    const driverError = error.driverError;

    return [
      `[QueryFailedError] ${error.message}`,
      driverError?.code ? `PostgreSQL code: ${driverError.code}` : null,
      driverError?.detail ? `Detail: ${driverError.detail}` : null,
      `Query: ${error.query}`,
      formatStack(error.stack),
    ];
  }

  if (error instanceof WorkspaceMigrationRunnerException) {
    return [
      `[WorkspaceMigrationRunnerException] ${error.message}`,
      `Code: ${error.code}`,
      error.action
        ? `Action: ${error.action.type} on ${error.action.metadataName}`
        : null,
      error.errors?.metadata
        ? `Metadata error: ${error.errors.metadata.message}`
        : null,
      error.errors?.workspaceSchema
        ? `Schema error: ${error.errors.workspaceSchema.message}`
        : null,
      error.errors?.actionTranspilation
        ? `Transpilation error: ${error.errors.actionTranspilation.message}`
        : null,
      formatStack(error.stack),
    ];
  }

  if (error instanceof WorkspaceMigrationBuilderException) {
    return [
      `[WorkspaceMigrationBuilderException] ${error.message}`,
      `Report: ${JSON.stringify(error.failedWorkspaceMigrationBuildResult.report, null, 2)}`,
      formatStack(error.stack),
    ];
  }

  if (error instanceof CustomError) {
    return [
      `[${error.name ?? 'CustomError'}] ${error.message}`,
      error.code ? `Code: ${error.code}` : null,
      formatStack(error.stack),
    ];
  }

  if (error instanceof Error) {
    return [
      `[${error.name ?? 'Error'}] ${error.message}`,
      formatStack(error.stack),
    ];
  }

  return [String(error)];
};

export const formatUpgradeErrorForStorage = (error: unknown): string => {
  return joinParts(buildErrorParts(error));
};
