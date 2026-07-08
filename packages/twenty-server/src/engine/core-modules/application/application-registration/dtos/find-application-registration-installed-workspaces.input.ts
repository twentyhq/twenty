import { Field, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

@InputType()
export class FindApplicationRegistrationInstalledWorkspacesInput {
  @Field()
  @IsString()
  id: string;

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
}
