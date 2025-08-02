import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('SearchRecord')
export class SearchRecordDTO {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  recordId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  objectNameSingular: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  label: string;

  @Field(() => String, { nullable: true })
  imageUrl: string;

  @Field(() => Number)
  @IsNumber()
  tsRankCD: number;

  @Field(() => Number)
  @IsNumber()
  tsRank: number;
}
