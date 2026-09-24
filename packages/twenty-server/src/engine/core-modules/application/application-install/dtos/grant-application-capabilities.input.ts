import { Field, InputType } from '@nestjs/graphql';

import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsIn,
  IsUUID,
} from 'class-validator';
import {
  APPLICATION_CAPABILITIES,
  type ApplicationCapability,
} from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class GrantApplicationCapabilitiesInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  applicationId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsIn(APPLICATION_CAPABILITIES, { each: true })
  @Field(() => [String])
  capabilities: ApplicationCapability[];
}
