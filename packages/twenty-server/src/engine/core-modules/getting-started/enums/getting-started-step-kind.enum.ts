import { registerEnumType } from '@nestjs/graphql';

export enum GettingStartedStepKind {
  BUILT_IN = 'BUILT_IN',
  WORKFLOW = 'WORKFLOW',
  AI_THREAD = 'AI_THREAD',
}

registerEnumType(GettingStartedStepKind, { name: 'GettingStartedStepKind' });
