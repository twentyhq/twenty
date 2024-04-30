import { Injectable } from '@nestjs/common';
import { GraphQLISODateTime } from '@nestjs/graphql';

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

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  StringFilterType,
  DateFilterType,
  FloatFilterType,
  BooleanFilterType,
  BigFloatFilterType,
  RawJsonFilterType,
  IntFilterType,
} from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input';
import { OrderByDirectionType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/enum';
import {
  BigFloatScalarType,
  UUIDScalarType,
} from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PositionScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars/position.scalar';
import { JsonScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars/json.scalar';
import { IDFilterType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/id-filter.input-type';

export interface TypeOptions<T = any> {
  nullable?: boolean;
  isArray?: boolean;
  arrayDepth?: number;
  defaultValue?: T;
  settings?: FieldMetadataSettings<FieldMetadataType | 'default'>;
  isIdField?: boolean;
}

@Injectable()
export class TypeMapperService {
  mapToScalarType(
    fieldMetadataType: FieldMetadataType,
    settings?: FieldMetadataSettings<FieldMetadataType | 'default'>,
    isIdField?: boolean,
  ): GraphQLScalarType | undefined {
    if (isIdField || settings?.isForeignKey) {
      return GraphQLID;
    }

    const numberScalar =
      fieldMetadataType === FieldMetadataType.NUMBER &&
      (settings as FieldMetadataSettings<FieldMetadataType.NUMBER>)
        ?.precision === 0
        ? GraphQLInt
        : GraphQLFloat;

    const typeScalarMapping = new Map<FieldMetadataType, GraphQLScalarType>([
      [FieldMetadataType.UUID, UUIDScalarType],
      [FieldMetadataType.TEXT, GraphQLString],
      [FieldMetadataType.PHONE, GraphQLString],
      [FieldMetadataType.EMAIL, GraphQLString],
      [FieldMetadataType.DATE_TIME, GraphQLISODateTime],
      [FieldMetadataType.DATE, GraphQLISODateTime],
      [FieldMetadataType.BOOLEAN, GraphQLBoolean],
      [FieldMetadataType.NUMBER, numberScalar],
      [FieldMetadataType.NUMERIC, BigFloatScalarType],
      [FieldMetadataType.PROBABILITY, GraphQLFloat],
      [FieldMetadataType.POSITION, PositionScalarType],
      [FieldMetadataType.RAW_JSON, JsonScalarType],
    ]);

    return typeScalarMapping.get(fieldMetadataType);
  }

  mapToFilterType(
    fieldMetadataType: FieldMetadataType,
    settings?: FieldMetadataSettings<FieldMetadataType | 'default'>,
    isIdField?: boolean,
  ): GraphQLInputObjectType | GraphQLScalarType | undefined {
    if (isIdField || settings?.isForeignKey) {
      return IDFilterType;
    }

    const numberScalar =
      fieldMetadataType === FieldMetadataType.NUMBER &&
      (settings as FieldMetadataSettings<FieldMetadataType.NUMBER>)
        ?.precision === 0
        ? IntFilterType
        : FloatFilterType;

    const typeFilterMapping = new Map<
      FieldMetadataType,
      GraphQLInputObjectType | GraphQLScalarType
    >([
      [FieldMetadataType.UUID, IDFilterType],
      [FieldMetadataType.TEXT, StringFilterType],
      [FieldMetadataType.PHONE, StringFilterType],
      [FieldMetadataType.EMAIL, StringFilterType],
      [FieldMetadataType.DATE_TIME, DateFilterType],
      [FieldMetadataType.DATE, DateFilterType],
      [FieldMetadataType.BOOLEAN, BooleanFilterType],
      [FieldMetadataType.NUMBER, numberScalar],
      [FieldMetadataType.NUMERIC, BigFloatFilterType],
      [FieldMetadataType.PROBABILITY, FloatFilterType],
      [FieldMetadataType.POSITION, FloatFilterType],
      [FieldMetadataType.RAW_JSON, RawJsonFilterType],
    ]);

    return typeFilterMapping.get(fieldMetadataType);
  }

  mapToOrderByType(
    fieldMetadataType: FieldMetadataType,
  ): GraphQLInputType | undefined {
    const typeOrderByMapping = new Map<FieldMetadataType, GraphQLEnumType>([
      [FieldMetadataType.UUID, OrderByDirectionType],
      [FieldMetadataType.TEXT, OrderByDirectionType],
      [FieldMetadataType.PHONE, OrderByDirectionType],
      [FieldMetadataType.EMAIL, OrderByDirectionType],
      [FieldMetadataType.DATE_TIME, OrderByDirectionType],
      [FieldMetadataType.DATE, OrderByDirectionType],
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
