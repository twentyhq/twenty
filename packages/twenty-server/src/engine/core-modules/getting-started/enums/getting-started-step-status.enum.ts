import { registerEnumType } from '@nestjs/graphql';

export enum GettingStartedStepStatus {
  TODO = 'TODO',
  DONE = 'DONE',
}

registerEnumType(GettingStartedStepStatus, {
  name: 'GettingStartedStepStatus',
});
