import { ArgsType, Field } from '@nestjs/graphql';

import { IsTimeZone, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class CoreWorkflowRunInsightsArgs {
  @Field(() => UUIDScalarType)
  @IsUUID()
  coreWorkflowId: string;

  @Field(() => String, {
    description: 'IANA time zone the days are counted in',
  })
  @IsTimeZone()
  timeZone: string;
}
