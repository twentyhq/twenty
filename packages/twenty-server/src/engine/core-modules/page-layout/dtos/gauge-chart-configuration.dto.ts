import { Field, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { ExtendedAggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/extended-aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { GraphType } from 'src/engine/core-modules/page-layout/enums/graph-type.enum';

@ObjectType('GaugeChartConfiguration')
export class GaugeChartConfigurationDTO {
  @Field(() => GraphType)
  @IsEnum(GraphType)
  @IsNotEmpty()
  graphType: GraphType.GAUGE;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  aggregateFieldMetadataId?: string;

  @Field(() => ExtendedAggregateOperations, { nullable: true })
  @IsEnum(ExtendedAggregateOperations)
  @IsOptional()
  aggregateOperation?: ExtendedAggregateOperations;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  displayDataLabel?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  color?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  filter?: ObjectRecordFilter;
}
