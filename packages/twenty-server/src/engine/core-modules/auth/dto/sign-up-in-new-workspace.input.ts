import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

@InputType()
export class SignUpInNewWorkspaceInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  displayName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  subdomain?: string;
}
