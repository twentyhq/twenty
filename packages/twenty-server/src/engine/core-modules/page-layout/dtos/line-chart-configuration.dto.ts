import { Field, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { ExtendedAggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/extended-aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AxisNameDisplay } from 'src/engine/core-modules/page-layout/enums/axis-name-display.enum';
import { GraphOrderBy } from 'src/engine/core-modules/page-layout/enums/graph-order-by.enum';
import { GraphType } from 'src/engine/core-modules/page-layout/enums/graph-type.enum';

@ObjectType('LineChartConfiguration')
export class LineChartConfigurationDTO {
  @Field(() => GraphType)
  @IsEnum(GraphType)
  @IsNotEmpty()
  graphType: GraphType.LINE;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  aggregateFieldMetadataId?: string;

  @Field(() => ExtendedAggregateOperations, { nullable: true })
  @IsEnum(ExtendedAggregateOperations)
  @IsOptional()
  aggregateOperation?: ExtendedAggregateOperations;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  groupByFieldMetadataIdX?: string;

  @Field(() => GraphOrderBy, { nullable: true })
  @IsEnum(GraphOrderBy)
  @IsOptional()
  orderByX?: GraphOrderBy;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  groupByFieldMetadataIdY?: string;

  @Field(() => GraphOrderBy, { nullable: true })
  @IsEnum(GraphOrderBy)
  @IsOptional()
  orderByY?: GraphOrderBy;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  omitNullValues?: boolean;

  @Field(() => AxisNameDisplay, { nullable: true })
  @IsEnum(AxisNameDisplay)
  @IsOptional()
  axisNameDisplay?: AxisNameDisplay;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  displayDataLabel?: boolean;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  rangeMin?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  rangeMax?: number;

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
