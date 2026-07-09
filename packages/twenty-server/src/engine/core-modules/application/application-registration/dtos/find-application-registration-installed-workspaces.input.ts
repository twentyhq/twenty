import { Field, InputType, Int } from '@nestjs/graphql';

import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

@InputType()
export class FindApplicationRegistrationInstalledWorkspacesInput {
  @Field()
  @IsString()
  id: string;

  @Field(() => Int, { defaultValue: 10 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(256)
  @IsOptional()
  searchTerm?: string;
}
