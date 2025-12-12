import { type Application } from 'twenty-shared/application';

export type ApplicationConfig = Omit<Application, 'ole'> & {
  ole?: Omit<
    NonNullable<Application['role']>,
    | 'canAccessAllTools'
    | 'canUpdateAllSettings'
    | 'canBeAssignedToAgents'
    | 'canBeAssignedToUsers'
    | 'canBeAssignedToApiKeys'
    | 'canBeAssignedToApplications'
  >;
};
