import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { GettingStartedStepStatus } from 'src/engine/core-modules/getting-started/enums/getting-started-step-status.enum';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';

@InputType()
export class GettingStartedStepStatusInput {
  @Field(() => GettingStartedStep)
  @IsEnum(GettingStartedStep)
  step: GettingStartedStep;

  @Field(() => GettingStartedStepStatus)
  @IsEnum(GettingStartedStepStatus)
  status: GettingStartedStepStatus;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  threadId?: string | null;
}
