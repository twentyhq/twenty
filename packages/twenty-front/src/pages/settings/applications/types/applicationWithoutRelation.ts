import { type Application } from '~/generated-metadata/graphql';

export type ApplicationWithoutRelation = Pick<
  Application,
  | 'id'
  | 'name'
  | 'description'
  | 'logoUrl'
  | 'version'
  | 'state'
  | 'universalIdentifier'
  | 'applicationRegistrationId'
  | 'applicationRegistration'
>;
