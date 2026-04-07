import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

@ObjectType('ApplicationRegistrationSummary')
export class ApplicationRegistrationSummaryDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  latestAvailableVersion?: string;

  @Field(() => ApplicationRegistrationSourceType)
  sourceType: ApplicationRegistrationSourceType;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  logoUrl?: string | null;
}
