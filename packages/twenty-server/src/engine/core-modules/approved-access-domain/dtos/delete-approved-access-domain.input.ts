import { Field, InputType } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class DeleteApprovedAccessDomainInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  id: string;
}
