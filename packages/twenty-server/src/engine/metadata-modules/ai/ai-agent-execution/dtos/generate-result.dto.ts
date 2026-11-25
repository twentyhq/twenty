import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type GenerateResult } from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AiRunUsageDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/ai-run-usage.dto';

@ObjectType('GenerateResult')
export class GenerateResultDTO implements GenerateResult {
  @Field()
  success: boolean;

  @Field(() => String, { nullable: true })
  text: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  object: Record<string, unknown> | null;

  @Field(() => String, { nullable: true })
  error: string | null;

  @Field(() => UUIDScalarType)
  runId: string;

  @Field(() => AiRunUsageDTO)
  usage: AiRunUsageDTO;
}
