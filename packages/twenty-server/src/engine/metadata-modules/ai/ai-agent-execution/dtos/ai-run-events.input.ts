import { ArgsType, Field } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// a run by its id, or a conversation by the agent and key runAgent was given
@ArgsType()
export class AiRunEventsInputDTO {
  @Field(() => UUIDScalarType, { nullable: true })
  runId?: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  agentUniversalIdentifier?: string | null;

  @Field(() => String, { nullable: true })
  threadKey?: string | null;

  @Field(() => String, { nullable: true })
  after?: string | null;
}
