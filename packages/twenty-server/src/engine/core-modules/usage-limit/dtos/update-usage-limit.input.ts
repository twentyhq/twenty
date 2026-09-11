import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';

@InputType()
export class UpdateUsageLimitInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  id: string;

  @Field(() => CreateUsageLimitInput)
  @Type(() => CreateUsageLimitInput)
  @ValidateNested()
  payload: CreateUsageLimitInput;
}
