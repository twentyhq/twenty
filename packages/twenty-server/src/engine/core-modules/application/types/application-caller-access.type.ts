import { type ApplicationTargetAccess } from 'src/engine/core-modules/application/types/application-target-access.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export type ApplicationCallerAccess = {
  callingApplication:
    | Pick<FlatApplication, 'id' | 'universalIdentifier' | 'sourceType'>
    | null
    | undefined;
} & (
  | { access: 'manage'; workspaceCustomApplicationId?: never }
  | {
      access: Exclude<ApplicationTargetAccess, 'manage'>;
      workspaceCustomApplicationId: string | undefined;
    }
);
