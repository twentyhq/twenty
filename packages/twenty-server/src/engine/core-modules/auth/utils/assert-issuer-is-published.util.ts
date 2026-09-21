import { isDefined } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { cleanServerUrl } from 'src/utils/clean-server-url';

export const assertIssuerIsPublishedOrThrow = ({
  issuer,
  requestBaseUrl,
  serverUrl,
}: {
  issuer: string;
  requestBaseUrl: string;
  serverUrl?: string;
}): void => {
  const publishedIssuers = [requestBaseUrl, cleanServerUrl(serverUrl)].filter(
    isDefined,
  );

  if (!publishedIssuers.includes(issuer)) {
    throw new AuthException(
      `Unknown issuer '${issuer}'`,
      AuthExceptionCode.FORBIDDEN_EXCEPTION,
    );
  }
};
