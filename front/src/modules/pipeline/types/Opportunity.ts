import { PipelineStep } from '@/pipeline/types/PipelineStep';
import { Person } from '~/generated-metadata/graphql';

export type Opportunity = {
  id: string;
  amount: {
    amountMicros: number;
    currencyCode: string;
  };
  closeDate: Date;
  probability: number;
  pipelineStepId: string;
  pipelineStep: PipelineStep;
  pointOfContactId: string;
  pointOfContact: Pick<Person, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  [key: string]: any;
};
