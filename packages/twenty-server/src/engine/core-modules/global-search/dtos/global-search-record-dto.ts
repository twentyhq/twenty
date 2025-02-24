import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@ObjectType()
export class GlobalSearchRecordDTO {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  recordId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  objectSingularName: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  label: string;

  @Field(() => String, { nullable: true })
  avatarUrl: string;

  @Field(() => Number)
  @IsNumber()
  tsRankCD: number;

  @Field(() => Number)
  @IsNumber()
  tsRank: number;
}
