import { Field, Int, ObjectType } from '@nestjs/graphql';

import { IsDateString } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentTurnEvaluation')
export class AgentTurnEvaluationDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  turnId: string;

  @Field(() => Int)
  score: number;

  @Field(() => String, { nullable: true })
  comment: string | null;

  @IsDateString()
  @Field()
  createdAt: Date;
}
