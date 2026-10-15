import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class ApplicationRegistrationAnalyticsInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  id: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  periodStart?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  periodEnd?: Date;
}
