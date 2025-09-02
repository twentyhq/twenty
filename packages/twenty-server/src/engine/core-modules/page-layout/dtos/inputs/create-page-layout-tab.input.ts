import { Field, InputType, Int } from '@nestjs/graphql';

import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreatePageLayoutTabInput {
  @Field({ nullable: false })
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;

  @Field(() => UUIDScalarType, { nullable: false })
  @IsUUID()
  @IsNotEmpty()
  pageLayoutId: string;
}
