import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WorkflowVisibility } from 'twenty-shared/types';

@InputType()
export class CreateCoreWorkflowInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => WorkflowVisibility, { nullable: true })
  @IsOptional()
  @IsEnum(WorkflowVisibility)
  visibility?: WorkflowVisibility;
}
