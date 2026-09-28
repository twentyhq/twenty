import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class AssignInputAskInput {
  @Field(() => UUIDScalarType, { description: 'Ask to assign' })
  @IsUUID()
  inputAskId: string;

  @Field(() => UUIDScalarType, {
    description: 'Workspace member who owes the answer, or null to unassign',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  workspaceMemberId: string | null;
}
