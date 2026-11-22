import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { WorkflowVisibility } from 'twenty-shared/types';

@InputType()
export class CreateCoreWorkflowInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @Field(() => WorkflowVisibility, {
    nullable: true,
    deprecationReason: 'Use isPrivate instead',
  })
  @IsOptional()
  @IsEnum(WorkflowVisibility)
  visibility?: WorkflowVisibility;
}
