import { ArgsType, Field } from '@nestjs/graphql';

import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

@ArgsType()
export class UpdateWorkspaceFeatureFlagInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  workspaceId: string;

  @Field(() => String)
  @IsNotEmpty()
  featureFlag: FeatureFlagKey;

  @Field(() => Boolean)
  @IsBoolean()
  value: boolean;
}
