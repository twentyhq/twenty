import { Field, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

@InputType('SetAppKeyValueInput')
export class SetAppKeyValueInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  key: string;

  @IsString()
  @Field()
  value: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Field(() => Int, { nullable: true })
  ttlInSeconds?: number;
}
