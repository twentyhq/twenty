import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';

@InputType()
export class CompleteGettingStartedStepInput {
  @Field(() => GettingStartedStep)
  @IsEnum(GettingStartedStep)
  step: GettingStartedStep;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  threadId?: string | null;
}
