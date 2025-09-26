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
import { GraphOrderBy } from 'src/engine/core-modules/page-layout/enums/graph-order-by.enum';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('PieChartConfiguration')
export class PieChartConfigurationDTO {
  @Field(() => GraphType)
  @IsEnum(GraphType)
  @IsNotEmpty()
  graphType: GraphType.PIE;

  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  aggregateFieldMetadataId: string;

  @Field(() => AggregateOperations)
  @IsEnum(AggregateOperations)
  @IsNotEmpty()
  aggregateOperation: AggregateOperations;

  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  groupByFieldMetadataId: string;

  @Field(() => GraphOrderBy)
  @IsEnum(GraphOrderBy)
  @IsNotEmpty()
  orderBy: GraphOrderBy;

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
