import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { GRANT_ACCESS_LEVELS } from 'twenty-shared/application';
import { RecordShareAccessLevel } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('ApplicationGrantAddedObjectInput')
export class ApplicationGrantAddedObjectInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @IsIn(GRANT_ACCESS_LEVELS)
  @Field(() => RecordShareAccessLevel)
  accessLevel: RecordShareAccessLevel;
}

@InputType('ApplicationGrantObjectAccessInput')
export class ApplicationGrantObjectAccessInput {
  // Omitted or null: the "all objects" request covers all objects, including future ones
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @Field(() => [UUIDScalarType], { nullable: true })
  chosenObjectMetadataIds?: string[] | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicationGrantAddedObjectInput)
  @Field(() => [ApplicationGrantAddedObjectInput])
  addedObjects: ApplicationGrantAddedObjectInput[];
}
