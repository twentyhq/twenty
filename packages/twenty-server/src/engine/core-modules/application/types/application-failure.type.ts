import { type ApplicationOperation } from 'src/engine/core-modules/application/enums/application-operation.enum';

export type ApplicationFailure = {
  operation: ApplicationOperation;
  reason: string;
};
