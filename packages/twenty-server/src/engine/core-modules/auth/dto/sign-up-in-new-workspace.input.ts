import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class SignUpInNewWorkspaceInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  displayName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  subdomain?: string;
}
