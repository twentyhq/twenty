import { type ApplicationWithoutRelation } from '@/applications/types/ApplicationWithoutRelation';

export type SettingsApplicationsTableApplication = Pick<
  ApplicationWithoutRelation,
  | 'id'
  | 'name'
  | 'description'
  | 'logoUrl'
  | 'universalIdentifier'
  | 'version'
  | 'applicationRegistration'
>;
