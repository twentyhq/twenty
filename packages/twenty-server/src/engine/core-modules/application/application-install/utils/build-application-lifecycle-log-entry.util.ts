import { isNonEmptyString } from '@sniptt/guards';
import { type ApplicationLogSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getApplicationErrorCode } from 'src/engine/core-modules/application/application-install/utils/get-application-error-code.util';
import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { buildApplicationPlatformLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/build-application-platform-log-entry';

type ApplicationLifecycleLogSource = Extract<
  ApplicationLogSource,
  'INSTALL' | 'UPGRADE' | 'UNINSTALL'
>;

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

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
      if (!isDefined(errorMessage)) {
        return `Upgraded from ${previousVersion} to ${version}.`;
      }

      return isNonEmptyString(version)
        ? `Upgrade from ${previousVersion} to ${version} failed: ${errorMessage}`
        : `Upgrade from ${previousVersion} failed: ${errorMessage}`;
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

  return buildApplicationPlatformLogEntry({
    workspaceId,
    applicationId,
    applicationRegistrationId,
    applicationVersion: version,
    source,
    level: hasFailed ? 'ERROR' : 'INFO',
    message: buildMessage({
      source,
      version,
      previousVersion,
      errorMessage: hasFailed ? getErrorMessage(error) : undefined,
    }),
    errorCode: hasFailed ? getApplicationErrorCode(error) : '',
    properties: isDefined(previousVersion) ? { previousVersion } : {},
  });
};
