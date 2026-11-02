import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { GRANT_ACCESS_LEVELS } from 'twenty-shared/application';
import { RecordShareAccessLevel } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('ApplicationGrantObjectInput')
export class ApplicationGrantObjectInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @IsIn(GRANT_ACCESS_LEVELS)
  @Field(() => RecordShareAccessLevel)
  accessLevel: RecordShareAccessLevel;
}

@InputType('ApplicationGrantObjectAccessInput')
export class ApplicationGrantObjectAccessInput {
  // Whether the "all objects" request keeps covering every object, including future ones
  @IsBoolean()
  @Field()
  coversAllObjects: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicationGrantObjectInput)
  @Field(() => [ApplicationGrantObjectInput])
  objects: ApplicationGrantObjectInput[];
}
