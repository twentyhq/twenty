import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AppRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/app-registration-source-type.enum';

@ObjectType('ApplicationRegistrationSummary')
export class ApplicationRegistrationSummaryDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  latestAvailableVersion?: string;

  @Field(() => AppRegistrationSourceType)
  sourceType: AppRegistrationSourceType;
}
