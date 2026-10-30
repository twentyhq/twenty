import { Field, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CancelAiActionInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  actionRequestId: string;

  @Field(() => Int)
  @IsInt()
  expectedStateVersion: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  clientRequestId: string;
}
