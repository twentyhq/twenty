import { Field, InputType, Int } from '@nestjs/graphql';

import {
  IsArray,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

@InputType()
export class AdminApplicationLogsInput {
  @Field(() => String)
  @IsString()
  applicationRegistrationId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  workspaceId?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  levels?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  logicFunctionName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  periodStart?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  periodEnd?: Date;

  @Field(() => Int, { nullable: true, defaultValue: 100 })
  @IsInt()
  @Min(1)
  @Max(500)
  @IsOptional()
  first?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  after?: string;
}
