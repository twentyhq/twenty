import { ArgsType, Field } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import { UpdateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/update-usage-limit.input';

@ArgsType()
export class AdminPanelWorkspaceUsageLimitsInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  workspaceId: string;
}

@ArgsType()
export class AdminPanelCreateUsageLimitInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  workspaceId: string;

  @Field(() => CreateUsageLimitInput)
  @Type(() => CreateUsageLimitInput)
  @ValidateNested()
  payload: CreateUsageLimitInput;
}

@ArgsType()
export class AdminPanelUpdateUsageLimitInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  workspaceId: string;

  @Field(() => UpdateUsageLimitInput)
  @Type(() => UpdateUsageLimitInput)
  @ValidateNested()
  payload: UpdateUsageLimitInput;
}

@ArgsType()
export class AdminPanelDeleteUsageLimitInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  workspaceId: string;

  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  usageLimitId: string;
}
