import { ID, InputType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

@InputType()
export class AgentIdInput {
  @IDField(() => ID, { description: 'The id of the agent.' })
  id!: string;
}
