import { type Application } from 'twenty-shared/application';

export type ApplicationConfig = Omit<Application, 'applicationRole'> & {
  applicationRole?: Omit<
    NonNullable<Application['applicationRole']>,
    | 'canAccessAllTools'
    | 'canUpdateAllSettings'
    | 'canBeAssignedToAgents'
    | 'canBeAssignedToUsers'
    | 'canBeAssignedToApiKeys'
    | 'canBeAssignedToApplications'
  >;
};
