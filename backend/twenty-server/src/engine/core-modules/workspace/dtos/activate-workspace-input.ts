import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

@InputType()
export class ActivateWorkspaceInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  displayName?: string;
}
