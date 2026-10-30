import { Field, InputType, Int } from '@nestjs/graphql';

import { IsIn, IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class DecideAiActionInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  actionRequestId: string;

  @Field(() => Int)
  @IsInt()
  expectedStateVersion: number;

  @Field(() => String, { description: 'approve or reject' })
  @IsIn(['approve', 'reject'])
  decision: 'approve' | 'reject';

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  clientRequestId: string;
}
