import { registerEnumType } from '@nestjs/graphql';

export enum GettingStartedStepKind {
  CUSTOM = 'CUSTOM',
  PROMPT = 'PROMPT',
  WORKFLOW = 'WORKFLOW',
}

registerEnumType(GettingStartedStepKind, { name: 'GettingStartedStepKind' });
