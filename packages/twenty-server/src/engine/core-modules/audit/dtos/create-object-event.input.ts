import { ArgsType, Field } from '@nestjs/graphql';

import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TrackEventName } from 'src/engine/core-modules/audit/types/events.type';

@ArgsType()
export class CreateObjectEventInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  event: TrackEventName;

  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  recordId: string;

  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  objectMetadataId: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties?: Record<string, any>;
}
