import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type AiRunEventType } from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { GenerateUsageDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/generate-usage.dto';
import { AiRunEventTypeEnum } from 'src/engine/metadata-modules/ai/ai-agent-execution/enums/ai-run-event-type.enum';

// AiRunEvent from twenty-shared, a union GraphQL flattens: a field is set on the types that carry it
@ObjectType('AiRunEvent')
export class AiRunEventDTO {
  @Field()
  id: string;

  @Field(() => UUIDScalarType)
  runId: string;

  @Field(() => AiRunEventTypeEnum)
  type: AiRunEventType;

  @Field()
  createdAt: string;

  @Field(() => String, { nullable: true })
  role?: 'user' | 'assistant';

  @Field(() => String, { nullable: true })
  text?: string;

  @Field(() => String, { nullable: true })
  toolCallId?: string;

  @Field(() => String, { nullable: true })
  toolName?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  input?: unknown;

  @Field(() => GraphQLJSON, { nullable: true })
  output?: unknown;

  @Field(() => Boolean, { nullable: true })
  isError?: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => GenerateUsageDTO, { nullable: true })
  usage?: GenerateUsageDTO | null;
}
