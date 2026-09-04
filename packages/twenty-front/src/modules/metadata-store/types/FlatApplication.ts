import { type Application } from '~/generated-metadata/graphql';

export type FlatApplication = Pick<
  Application,
  | 'id'
  | 'universalIdentifier'
  | 'name'
  | 'description'
  | 'version'
  | 'state'
  | 'failedOperation'
  | 'failureReason'
  | 'applicationRegistrationId'
>;
