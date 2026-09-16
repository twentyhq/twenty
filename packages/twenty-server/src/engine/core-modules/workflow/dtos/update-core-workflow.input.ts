import { Field, InputType } from '@nestjs/graphql';

import { IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateCoreWorkflowInput {
  @Field(() => UUIDScalarType, { nullable: false })
  @IsUUID()
  coreWorkflowId: string;

  @Field(() => String, { nullable: false })
  @IsString()
  name: string;
}
