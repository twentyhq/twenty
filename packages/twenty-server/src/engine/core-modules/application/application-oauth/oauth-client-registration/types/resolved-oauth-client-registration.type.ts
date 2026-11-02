import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

export type ResolvedOAuthClientRegistration = Omit<
  ApplicationRegistrationEntity,
  'manifest' | 'isVetted' | 'deletedAt'
>;
