import { Injectable } from '@nestjs/common';
import { GraphQLISODateTime, GraphQLTimestamp } from '@nestjs/graphql';

import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLString,
  GraphQLType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

import {
  DateScalarMode,
  NumberScalarMode,
} from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  UUIDFilterType,
  StringFilterType,
  DatetimeFilterType,
  DateFilterType,
  FloatFilterType,
  IntFilterType,
  BooleanFilterType,
  BigFloatFilterType,
  RawJsonFilterType,
} from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input';
import { OrderByDirectionType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/enum';
import { BigFloatScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PositionScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars/position.scalar';

export interface TypeOptions<T = any> {
  nullable?: boolean;
  isArray?: boolean;
  arrayDepth?: number;
  defaultValue?: T;
}

@Injectable()
export class TypeMapperService {
  mapToScalarType(
    fieldMetadataType: FieldMetadataType,
    dateScalarMode: DateScalarMode = 'isoDate',
    numberScalarMode: NumberScalarMode = 'float',
  ): GraphQLScalarType | undefined {
    const dateScalar =
      dateScalarMode === 'timestamp' ? GraphQLTimestamp : GraphQLISODateTime;
    const numberScalar =
      numberScalarMode === 'float' ? GraphQLFloat : GraphQLInt;

    // LINK and CURRENCY are handled in the factories because they are objects
    const typeScalarMapping = new Map<FieldMetadataType, GraphQLScalarType>([
      [FieldMetadataType.UUID, GraphQLID],
      [FieldMetadataType.TEXT, GraphQLString],
      [FieldMetadataType.PHONE, GraphQLString],
      [FieldMetadataType.EMAIL, GraphQLString],
      [FieldMetadataType.DATE_TIME, dateScalar],
      [FieldMetadataType.BOOLEAN, GraphQLBoolean],
      [FieldMetadataType.NUMBER, numberScalar],
      [FieldMetadataType.NUMERIC, BigFloatScalarType],
      [FieldMetadataType.PROBABILITY, GraphQLFloat],
      [FieldMetadataType.RELATION, GraphQLID],
      [FieldMetadataType.POSITION, PositionScalarType],
      [FieldMetadataType.RAW_JSON, GraphQLJSON],
    ]);

    return typeScalarMapping.get(fieldMetadataType);
  }

  mapToFilterType(
    fieldMetadataType: FieldMetadataType,
    dateScalarMode: DateScalarMode = 'isoDate',
    numberScalarMode: NumberScalarMode = 'float',
  ): GraphQLInputObjectType | GraphQLScalarType | undefined {
    const dateFilter =
      dateScalarMode === 'timestamp' ? DatetimeFilterType : DateFilterType;
    const numberScalar =
      numberScalarMode === 'float' ? FloatFilterType : IntFilterType;

    // LINK and CURRENCY are handled in the factories because they are objects
    const typeFilterMapping = new Map<
      FieldMetadataType,
      GraphQLInputObjectType | GraphQLScalarType
    >([
      [FieldMetadataType.UUID, UUIDFilterType],
      [FieldMetadataType.TEXT, StringFilterType],
      [FieldMetadataType.PHONE, StringFilterType],
      [FieldMetadataType.EMAIL, StringFilterType],
      [FieldMetadataType.DATE_TIME, dateFilter],
      [FieldMetadataType.BOOLEAN, BooleanFilterType],
      [FieldMetadataType.NUMBER, numberScalar],
      [FieldMetadataType.NUMERIC, BigFloatFilterType],
      [FieldMetadataType.PROBABILITY, FloatFilterType],
      [FieldMetadataType.RELATION, UUIDFilterType],
      [FieldMetadataType.POSITION, FloatFilterType],
      [FieldMetadataType.RAW_JSON, RawJsonFilterType],
    ]);

    return typeFilterMapping.get(fieldMetadataType);
  }

  mapToOrderByType(
    fieldMetadataType: FieldMetadataType,
  ): GraphQLInputType | undefined {
    // LINK and CURRENCY are handled in the factories because they are objects
    const typeOrderByMapping = new Map<FieldMetadataType, GraphQLEnumType>([
      [FieldMetadataType.UUID, OrderByDirectionType],
      [FieldMetadataType.TEXT, OrderByDirectionType],
      [FieldMetadataType.PHONE, OrderByDirectionType],
      [FieldMetadataType.EMAIL, OrderByDirectionType],
      [FieldMetadataType.DATE_TIME, OrderByDirectionType],
      [FieldMetadataType.BOOLEAN, OrderByDirectionType],
      [FieldMetadataType.NUMBER, OrderByDirectionType],
      [FieldMetadataType.NUMERIC, OrderByDirectionType],
      [FieldMetadataType.PROBABILITY, OrderByDirectionType],
      [FieldMetadataType.RATING, OrderByDirectionType],
      [FieldMetadataType.SELECT, OrderByDirectionType],
      [FieldMetadataType.MULTI_SELECT, OrderByDirectionType],
      [FieldMetadataType.POSITION, OrderByDirectionType],
      [FieldMetadataType.RAW_JSON, OrderByDirectionType],
    ]);

    return typeOrderByMapping.get(fieldMetadataType);
  }

  mapToGqlType<T extends GraphQLType = GraphQLType>(
    typeRef: T,
    options: TypeOptions,
  ): T {
    let graphqlType: T | GraphQLList<T> | GraphQLNonNull<T> = typeRef;

    if (options.isArray) {
      graphqlType = this.mapToGqlList(
        graphqlType,
        options.arrayDepth ?? 1,
        options.nullable ?? false,
      );
    }

    if (options.nullable === false && options.defaultValue === null) {
      graphqlType = new GraphQLNonNull(graphqlType) as unknown as T;
    }

    return graphqlType as T;
  }

  private mapToGqlList<T extends GraphQLType = GraphQLType>(
    targetType: T,
    depth: number,
    nullable: boolean,
  ): GraphQLList<T> {
    const targetTypeNonNull = nullable
      ? targetType
      : new GraphQLNonNull(targetType);

    if (depth === 0) {
      return targetType as GraphQLList<T>;
    }

    return this.mapToGqlList<T>(
      new GraphQLList(targetTypeNonNull) as unknown as T,
      depth - 1,
      nullable,
    );
  }
}
