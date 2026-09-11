import { Field, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class PrivateApplicationDeploymentLogoInput {
  @Field()
  @IsString()
  filename: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  size: number;
}

@InputType()
export class CreatePrivateApplicationDeploymentInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  universalIdentifier: string;

  @Field()
  @IsString()
  version: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  tarballSize: number;

  @Field(() => PrivateApplicationDeploymentLogoInput, { nullable: true })
  @ValidateNested()
  @Type(() => PrivateApplicationDeploymentLogoInput)
  logo?: PrivateApplicationDeploymentLogoInput;
}
