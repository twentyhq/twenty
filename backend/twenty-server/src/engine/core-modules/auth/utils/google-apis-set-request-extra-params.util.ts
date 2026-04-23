import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type APIsOAuthRequest } from 'src/engine/core-modules/auth/types/apis-oauth-request.type';

type APIsOAuthRequestExtraParams = {
  transientToken?: string;
  redirectLocation?: string;
  calendarVisibility?: string;
  messageVisibility?: string;
  loginHint?: string;
  userId?: string;
  workspaceId?: string;
  skipMessageChannelConfiguration?: string;
};

export const setRequestExtraParams = (
  request: APIsOAuthRequest,
  params: APIsOAuthRequestExtraParams,
): void => {
  const {
    transientToken,
    redirectLocation,
    calendarVisibility,
    messageVisibility,
    loginHint,
    userId,
    workspaceId,
    skipMessageChannelConfiguration,
  } = params;

  if (!transientToken) {
    throw new AuthException(
      'transientToken is required',
      AuthExceptionCode.INVALID_INPUT,
    );
  }

  request.params.transientToken = transientToken;

  if (redirectLocation) {
    request.params.redirectLocation = redirectLocation;
  }

  if (calendarVisibility) {
    request.params.calendarVisibility = calendarVisibility;
  }

  if (messageVisibility) {
    request.params.messageVisibility = messageVisibility;
  }

  if (loginHint) {
    request.params.loginHint = loginHint;
  }

  if (userId) {
    request.params.userId = userId;
  }

  if (workspaceId) {
    request.params.workspaceId = workspaceId;
  }

  if (skipMessageChannelConfiguration) {
    request.params.skipMessageChannelConfiguration =
      skipMessageChannelConfiguration;
  }
};
