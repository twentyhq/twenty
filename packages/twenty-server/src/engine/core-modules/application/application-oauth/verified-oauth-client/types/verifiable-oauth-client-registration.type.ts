import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

export type VerifiableOAuthClientRegistration = Pick<
  ApplicationRegistrationEntity,
  | 'universalIdentifier'
  | 'sourceType'
  | 'ownerWorkspaceId'
  | 'createdByUserId'
  | 'oAuthClientSecretHash'
  | 'oAuthClientId'
>;
