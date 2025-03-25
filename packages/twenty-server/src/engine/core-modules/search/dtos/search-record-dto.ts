import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@ObjectType('SearchRecord')
export class SearchRecordDTO {
  @Field(() => String)
  @IsString()
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
