import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateCoreWorkflowInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;
}
