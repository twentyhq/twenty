import { Field, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsObject, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class ReviseAiActionInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  actionRequestId: string;

  @Field(() => Int)
  @IsInt()
  expectedStateVersion: number;

  @Field(() => GraphQLJSON, {
    description:
      'Email: to, cc, bcc, subject, body. Record update: fields. Validated like a new proposal.',
  })
  @IsObject()
  edits: Record<string, unknown>;
}
