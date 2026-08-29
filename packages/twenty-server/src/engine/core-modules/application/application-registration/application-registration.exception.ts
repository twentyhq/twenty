import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ApplicationRegistrationExceptionCode {
  APPLICATION_REGISTRATION_NOT_FOUND = 'APPLICATION_REGISTRATION_NOT_FOUND',
  UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED = 'UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED',
  INVALID_SCOPE = 'INVALID_SCOPE',
  INVALID_REDIRECT_URI = 'INVALID_REDIRECT_URI',
  INVALID_INPUT = 'INVALID_INPUT',
  SOURCE_CHANNEL_MISMATCH = 'SOURCE_CHANNEL_MISMATCH',
  VARIABLE_NOT_FOUND = 'VARIABLE_NOT_FOUND',
  VERSION_ALREADY_EXISTS = 'VERSION_ALREADY_EXISTS',
  SERVER_VERSION_INCOMPATIBLE = 'SERVER_VERSION_INCOMPATIBLE',
  INVALID_APP_ENGINE_REQUIREMENT = 'INVALID_APP_ENGINE_REQUIREMENT',
  INVALID_SERVER_VERSION = 'INVALID_SERVER_VERSION',
  APPLICATION_REGISTRATION_ALREADY_OWNED = 'APPLICATION_REGISTRATION_ALREADY_OWNED',
  CLAIM_NOT_SUPPORTED = 'CLAIM_NOT_SUPPORTED',
  CLAIM_NOT_CONFIGURED = 'CLAIM_NOT_CONFIGURED',
  PROVENANCE_NOT_FOUND = 'PROVENANCE_NOT_FOUND',
  PROVENANCE_CHECK_UNAVAILABLE = 'PROVENANCE_CHECK_UNAVAILABLE',
  GITHUB_AUTH_FAILED = 'GITHUB_AUTH_FAILED',
  GITHUB_ORG_OWNERSHIP_REQUIRED = 'GITHUB_ORG_OWNERSHIP_REQUIRED',
}

const getExceptionUserFriendlyMessage = (
  code: ApplicationRegistrationExceptionCode,
) => {
  switch (code) {
    case ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND:
      return msg`Application registration not found.`;
    case ApplicationRegistrationExceptionCode.UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED:
      return msg`This universal identifier is already claimed by another registration.`;
    case ApplicationRegistrationExceptionCode.INVALID_SCOPE:
      return msg`One or more requested scopes are invalid.`;
    case ApplicationRegistrationExceptionCode.INVALID_REDIRECT_URI:
      return msg`One or more redirect URIs are invalid.`;
    case ApplicationRegistrationExceptionCode.INVALID_INPUT:
      return msg`Invalid input for application registration.`;
    case ApplicationRegistrationExceptionCode.SOURCE_CHANNEL_MISMATCH:
      return msg`The app source channel does not match the expected type.`;
    case ApplicationRegistrationExceptionCode.VARIABLE_NOT_FOUND:
      return msg`Application registration variable not found.`;
    case ApplicationRegistrationExceptionCode.VERSION_ALREADY_EXISTS:
      return msg`This version is not higher than the currently deployed version. Please bump the version in package.json before deploying again.`;
    case ApplicationRegistrationExceptionCode.SERVER_VERSION_INCOMPATIBLE:
      return msg`This app requires a newer version of the Twenty server. Please upgrade your server or use a compatible app version.`;
    case ApplicationRegistrationExceptionCode.INVALID_APP_ENGINE_REQUIREMENT:
      return msg`The app manifest declares an invalid server version requirement.`;
    case ApplicationRegistrationExceptionCode.INVALID_SERVER_VERSION:
      return msg`The server's APP_VERSION is not a valid semver version. Self-hosted instances must configure a valid APP_VERSION.`;
    case ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_ALREADY_OWNED:
      return msg`This application is already owned by a workspace.`;
    case ApplicationRegistrationExceptionCode.CLAIM_NOT_SUPPORTED:
      return msg`Only applications published to npm can be claimed this way.`;
    case ApplicationRegistrationExceptionCode.CLAIM_NOT_CONFIGURED:
      return msg`Claiming is not configured on this server. Ask an administrator to configure the GitHub OAuth app.`;
    case ApplicationRegistrationExceptionCode.PROVENANCE_NOT_FOUND:
      return msg`No provenance attestation was found for the published package. Publish it with npm trusted publishing from GitHub Actions, then try again.`;
    case ApplicationRegistrationExceptionCode.PROVENANCE_CHECK_UNAVAILABLE:
      return msg`The package registry could not be reached to verify the package provenance. Try again later.`;
    case ApplicationRegistrationExceptionCode.GITHUB_AUTH_FAILED:
      return msg`GitHub authentication failed. Try connecting your GitHub account again.`;
    case ApplicationRegistrationExceptionCode.GITHUB_ORG_OWNERSHIP_REQUIRED:
      return msg`Your GitHub account does not own the organization that publishes this package. If you are an owner, make sure you granted this app access to the organization on GitHub's authorization screen (Organization access section).`;
    default:
      assertUnreachable(code);
  }
};

export class ApplicationRegistrationException extends CustomException<ApplicationRegistrationExceptionCode> {
  constructor(
    message: string,
    code: ApplicationRegistrationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getExceptionUserFriendlyMessage(code),
    });
  }
}
