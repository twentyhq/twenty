import { registerEnumType } from '@nestjs/graphql';

export enum PipelineStageProbability {
  NEW = 'NEW',
  SCREENING = 'SCREENING',
  MEETING = 'MEETING',
  PROPOSAL = 'PROPOSAL',
  CUSTOMER = 'CUSTOMER',
  WON = 'WON',
  LOST = 'LOST',
}

registerEnumType(PipelineStageProbability, {
  name: 'PipelineStageProbability',
  description: 'Probability by stage',
});
