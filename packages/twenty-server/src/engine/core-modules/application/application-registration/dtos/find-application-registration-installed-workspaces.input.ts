import { Field, InputType, Int } from '@nestjs/graphql';

import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  INSTALLED_WORKSPACES_DEFAULT_LIMIT,
  INSTALLED_WORKSPACES_DEFAULT_OFFSET,
} from 'src/engine/core-modules/application/application-registration/constants/installed-workspaces-pagination.constant';

@InputType()
export class FindApplicationRegistrationInstalledWorkspacesInput {
  @Field()
  @IsString()
  id: string;

  @Field(() => Int, { defaultValue: INSTALLED_WORKSPACES_DEFAULT_LIMIT })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;

  @Field(() => Int, { defaultValue: INSTALLED_WORKSPACES_DEFAULT_OFFSET })
  @IsInt()
  @Min(0)
  offset: number;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(256)
  @IsOptional()
  searchTerm?: string;
}
