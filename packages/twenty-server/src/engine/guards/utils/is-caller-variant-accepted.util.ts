import { isObject } from '@sniptt/guards';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  type CallerGuardConfig,
  type UserSessionCallerOptions,
} from 'src/engine/guards/types/caller-guard-config.type';
import { type CallerVariant } from 'src/engine/guards/types/caller-variant.type';

const isApplicationKindAccepted = ({
  applicationKindConfig,
  hasUser,
}: {
  applicationKindConfig: CallerGuardConfig['application'];
  hasUser: boolean;
}): boolean =>
  applicationKindConfig === true ||
  (isObject(applicationKindConfig) &&
    (hasUser || applicationKindConfig.requireUser !== true));

export const isCallerVariantAccepted = ({
  callerGuardConfig,
  callerVariant,
}: {
  callerGuardConfig: CallerGuardConfig;
  callerVariant: CallerVariant;
}): boolean => {
  const { userSession, apiKey, oauthClient, application } = callerGuardConfig;

  const isUserSessionAccepted = userSession === true || isObject(userSession);
  const userSessionOptions: UserSessionCallerOptions = isObject(userSession)
    ? userSession
    : {};

  switch (callerVariant) {
    case 'session':
      return isUserSessionAccepted;
    case 'impersonatedSession':
      return (
        isUserSessionAccepted && userSessionOptions.impersonation !== false
      );
    case 'playgroundSession':
      return isUserSessionAccepted && userSessionOptions.playground !== false;
    case 'workspaceAgnosticSession':
      return (
        isUserSessionAccepted && userSessionOptions.workspaceAgnostic === true
      );
    case 'apiKey':
      return apiKey === true;
    case 'oauthClientWithUser':
    case 'oauthClientWithoutUser':
      return isApplicationKindAccepted({
        applicationKindConfig: oauthClient,
        hasUser: callerVariant === 'oauthClientWithUser',
      });
    case 'applicationWithUser':
    case 'applicationWithoutUser':
      return isApplicationKindAccepted({
        applicationKindConfig: application,
        hasUser: callerVariant === 'applicationWithUser',
      });
    default:
      return assertUnreachable(callerVariant);
  }
};
