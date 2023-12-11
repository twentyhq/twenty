import { Person } from '@/people/types/Person';
import { PipelineStep } from '@/pipeline/types/PipelineStep';

export type Opportunity = {
  [key: string]: any;
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
  pointOfContact: Pick<Person, 'id' | 'name' | 'avatarUrl'>;
};
