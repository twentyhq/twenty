import { Field, ObjectType } from '@nestjs/graphql';

import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { GraphType } from 'src/engine/core-modules/page-layout/enums/graph-type.enum';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('NumberChartConfiguration')
export class NumberChartConfigurationDTO {
  @Field(() => GraphType)
  @IsEnum(GraphType)
  @IsNotEmpty()
  graphType: GraphType.NUMBER;

  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  aggregateFieldMetadataId: string;

  @Field(() => AggregateOperations)
  @IsEnum(AggregateOperations)
  @IsNotEmpty()
  aggregateOperation: AggregateOperations;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  label?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  format?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  color?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  filter?: ObjectRecordFilter;
}
