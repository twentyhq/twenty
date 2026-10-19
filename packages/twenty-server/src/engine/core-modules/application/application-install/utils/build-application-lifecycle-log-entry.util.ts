import { type ApplicationLogSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';

type ApplicationLifecycleLogSource = Extract<
  ApplicationLogSource,
  'INSTALL' | 'UPGRADE' | 'UNINSTALL'
>;

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const getErrorCode = (error: unknown): string =>
  error instanceof ApplicationException ? error.code : 'UNKNOWN';

const buildMessage = ({
  source,
  version,
  previousVersion,
  errorMessage,
}: {
  source: ApplicationLifecycleLogSource;
  version: string;
  previousVersion?: string;
  errorMessage?: string;
}): string => {
  switch (source) {
    case 'INSTALL':
      return isDefined(errorMessage)
        ? `Install failed: ${errorMessage}`
        : `Installed version ${version}.`;
    case 'UPGRADE':
      return isDefined(errorMessage)
        ? `Upgrade from ${previousVersion} to ${version} failed: ${errorMessage}`
        : `Upgraded from ${previousVersion} to ${version}.`;
    case 'UNINSTALL':
      return isDefined(errorMessage)
        ? `Uninstall failed: ${errorMessage}`
        : 'Uninstalled.';
  }
};

export const buildApplicationLifecycleLogEntry = ({
  source,
  workspaceId,
  applicationId,
  applicationRegistrationId,
  version,
  previousVersion,
  error,
}: {
  source: ApplicationLifecycleLogSource;
  workspaceId: string;
  applicationId: string;
  applicationRegistrationId: string;
  version: string;
  previousVersion?: string;
  error?: unknown;
}): ApplicationLogEntry => {
  const hasFailed = isDefined(error);

  return {
    timestamp: new Date(),
    workspaceId,
    applicationId,
    applicationRegistrationId,
    applicationVersion: version,
    source,
    logicFunctionId: '',
    logicFunctionName: '',
    executionId: '',
    level: hasFailed ? 'ERROR' : 'INFO',
    message: buildMessage({
      source,
      version,
      previousVersion,
      errorMessage: hasFailed ? getErrorMessage(error) : undefined,
    }),
    errorCode: hasFailed ? getErrorCode(error) : '',
    properties: isDefined(previousVersion) ? { previousVersion } : {},
  };
};
