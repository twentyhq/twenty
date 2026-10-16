import { type ApplicationBilling } from 'twenty-shared/application';

export type ApplicationCreditInstallation = {
  id: string;
  workspaceId: string;
  billing: ApplicationBilling | null;
};
