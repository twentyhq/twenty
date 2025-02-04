import { CreateAgentInput } from '~/generated-metadata/graphql';

export interface UpdateAgentInput extends CreateAgentInput {
  id: string;
}
