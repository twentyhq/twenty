import { type ApplicationRegistrationVersionActiveWorkspacesRow } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-version-active-workspaces-row.type';

export type ApplicationRegistrationDailyVersionActiveWorkspacesRow =
  ApplicationRegistrationVersionActiveWorkspacesRow & {
    date: string;
  };
