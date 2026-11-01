import { type ApplicationOperation } from 'src/engine/core-modules/application/types/application-operation.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export type ApplicationCallerOperation = {
  callingApplication:
    | Pick<FlatApplication, 'id' | 'universalIdentifier' | 'sourceType'>
    | null
    | undefined;
} & (
  | { operation: 'manage'; workspaceCustomApplicationId?: never }
  | {
      operation: Exclude<ApplicationOperation, 'manage'>;
      workspaceCustomApplicationId: string | undefined;
    }
);
