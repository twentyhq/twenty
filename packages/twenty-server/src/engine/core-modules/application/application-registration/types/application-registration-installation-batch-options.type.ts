import { type ApplicationHealthIdentity } from 'src/engine/core-modules/application/application-health/types/application-health-identity.type';
import { type ApplicationCreditInstallation } from 'src/engine/core-modules/application/application-registration/types/application-credit-installation.type';

export type ApplicationRegistrationInstallationBatchOptions = {
  applicationRegistrationId: string;
} & (
  | {
      mode: 'health';
      processBatch: (
        applications: ApplicationHealthIdentity[],
      ) => Promise<void>;
    }
  | {
      mode: 'credit';
      processBatch: (
        applications: ApplicationCreditInstallation[],
      ) => Promise<void>;
    }
);
