import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

export const PUBLIC_OAUTH_CLIENT_REGISTRATION_VALUES = {
  oAuthClientSecretHash: null,
  createdByUserId: null,
  ownerWorkspaceId: null,
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
} as const;
