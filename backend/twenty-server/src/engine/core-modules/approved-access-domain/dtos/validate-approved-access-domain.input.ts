import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class ValidateApprovedAccessDomainInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  validationToken: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  approvedAccessDomainId: string;
}
