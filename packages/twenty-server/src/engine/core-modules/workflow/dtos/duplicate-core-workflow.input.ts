import { Field, InputType } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class DuplicateCoreWorkflowInput {
  @Field(() => UUIDScalarType, {
    description: 'Core workflow ID to duplicate',
    nullable: false,
  })
  @IsUUID()
  coreWorkflowIdToDuplicate: string;

  @Field(() => UUIDScalarType, {
    description: 'Core workflow version ID to copy',
    nullable: false,
  })
  @IsUUID()
  coreWorkflowVersionIdToCopy: string;
}
