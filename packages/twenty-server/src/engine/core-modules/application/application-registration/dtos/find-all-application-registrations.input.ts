import { Field, InputType, Int } from '@nestjs/graphql';

import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

@InputType()
export class FindAllApplicationRegistrationsInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(256)
  @IsOptional()
  searchTerm?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isPreInstalledOnly?: boolean;
}
