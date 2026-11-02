import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationGrantObjectAccessInput } from 'src/engine/core-modules/application/application-grant/dtos/application-grant-object-access.input';

@InputType('UpdateApplicationGrantObjectAccessInput')
export class UpdateApplicationGrantObjectAccessInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  applicationId: string;

  @ValidateNested()
  @Type(() => ApplicationGrantObjectAccessInput)
  @Field(() => ApplicationGrantObjectAccessInput)
  objectAccess: ApplicationGrantObjectAccessInput;
}
