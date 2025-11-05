import { Injectable } from '@nestjs/common';
import { GraphQLISODateTime } from '@nestjs/graphql';

import {
  GraphQLBoolean,
  type GraphQLEnumType,
  GraphQLID,
  type GraphQLInputObjectType,
  type GraphQLInputType,
  GraphQLList,
  GraphQLNonNull,
  type GraphQLScalarType,
  GraphQLString,
  type GraphQLType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { isDefined } from 'twenty-shared/utils';
import {
  FieldMetadataType,
  type FieldMetadataSettings,
  NumberDataType,
} from 'twenty-shared/types';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { OrderByDirectionType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/enum';
import {
  ArrayFilterType,
  BigFloatFilterType,
  BooleanFilterType,
  DateFilterType,
  FloatFilterType,
  RawJsonFilterType,
  StringFilterType,
} from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input';
import { MultiSelectFilterType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/multi-select-filter.input-type';
import { RichTextV2FilterType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/rich-text.input-type';
import { SelectFilterType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/select-filter.input-type';
import { TSVectorFilterType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/ts-vector-filter.input-type';
import { UUIDFilterType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/uuid-filter.input-type';
import {
  BigFloatScalarType,
  DateScalarType,
  TSVectorScalarType,
  UUIDScalarType,
} from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PositionScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars/position.scalar';
import { getNumberFilterType } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-number-filter-type.util';
import { getNumberScalarType } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-number-scalar-type.util';

export interface TypeOptions {
  nullable?: boolean;
  isArray?: boolean;
  arrayDepth?: number;
  defaultValue?: FieldMetadataDefaultValue<FieldMetadataType>;
  settings?: FieldMetadataSettings<FieldMetadataType>;
  isIdField?: boolean;
  isRelationConnectField?: boolean;
}

const StringArrayScalarType = new GraphQLList(GraphQLString);

@Injectable()
export class TypeMapperService {
  mapToScalarType(
    fieldMetadataType: FieldMetadataType,
    typeOptions?: TypeOptions,
  ): GraphQLScalarType | undefined {
    if (
      typeOptions?.isIdField ||
      fieldMetadataType === FieldMetadataType.RELATION ||
      fieldMetadataType === FieldMetadataType.MORPH_RELATION
    ) {
      return GraphQLID;
    }
    const typeScalarMapping = new Map<FieldMetadataType, GraphQLScalarType>([
      [FieldMetadataType.UUID, UUIDScalarType],
      [FieldMetadataType.TEXT, GraphQLString],
      [FieldMetadataType.DATE_TIME, GraphQLISODateTime],
      [FieldMetadataType.DATE, DateScalarType],
      [FieldMetadataType.BOOLEAN, GraphQLBoolean],
      [
        FieldMetadataType.NUMBER,
        getNumberScalarType(
          (
            typeOptions?.settings as FieldMetadataSettings<FieldMetadataType.NUMBER>
          )?.dataType ?? NumberDataType.FLOAT,
        ),
      ],
      [FieldMetadataType.NUMERIC, BigFloatScalarType],
      [FieldMetadataType.POSITION, PositionScalarType],
      [FieldMetadataType.RAW_JSON, GraphQLJSON],
      [
        FieldMetadataType.ARRAY,
        StringArrayScalarType as unknown as GraphQLScalarType,
      ],
      [FieldMetadataType.RICH_TEXT, GraphQLString],
      [FieldMetadataType.TS_VECTOR, TSVectorScalarType],
    ]);

    return typeScalarMapping.get(fieldMetadataType);
  }

  mapToFilterType(
    fieldMetadataType: FieldMetadataType,
    typeOptions?: TypeOptions,
  ): GraphQLInputObjectType | GraphQLScalarType | undefined {
    if (
      typeOptions?.isIdField ||
      fieldMetadataType === FieldMetadataType.RELATION ||
      fieldMetadataType === FieldMetadataType.MORPH_RELATION
    ) {
      return UUIDFilterType;
    }

    const typeFilterMapping = new Map<
      FieldMetadataType,
      GraphQLInputObjectType | GraphQLScalarType
    >([
      [FieldMetadataType.UUID, UUIDFilterType],
      [FieldMetadataType.TEXT, StringFilterType],
      [FieldMetadataType.DATE_TIME, GraphQLISODateTime],
      [FieldMetadataType.DATE, DateFilterType],
      [FieldMetadataType.BOOLEAN, BooleanFilterType],
      [
        FieldMetadataType.NUMBER,
        getNumberFilterType(
          (
            typeOptions?.settings as FieldMetadataSettings<FieldMetadataType.NUMBER>
          )?.dataType,
        ),
      ],
      [FieldMetadataType.NUMERIC, BigFloatFilterType],
      [FieldMetadataType.POSITION, FloatFilterType],
      [FieldMetadataType.RAW_JSON, RawJsonFilterType],
      [FieldMetadataType.RICH_TEXT, StringFilterType],
      [FieldMetadataType.RICH_TEXT_V2, RichTextV2FilterType],
      [FieldMetadataType.ARRAY, ArrayFilterType],
      [FieldMetadataType.MULTI_SELECT, MultiSelectFilterType],
      [FieldMetadataType.SELECT, SelectFilterType],
      [FieldMetadataType.TS_VECTOR, TSVectorFilterType],
    ]);

    return typeFilterMapping.get(fieldMetadataType);
  }

  mapToOrderByType(
    fieldMetadataType: FieldMetadataType,
  ): GraphQLInputType | undefined {
    const typeOrderByMapping = new Map<FieldMetadataType, GraphQLEnumType>([
      [FieldMetadataType.UUID, OrderByDirectionType],
      [FieldMetadataType.RELATION, OrderByDirectionType],
      [FieldMetadataType.MORPH_RELATION, OrderByDirectionType],
      [FieldMetadataType.TEXT, OrderByDirectionType],
      [FieldMetadataType.DATE_TIME, OrderByDirectionType],
      [FieldMetadataType.DATE, OrderByDirectionType],
      [FieldMetadataType.BOOLEAN, OrderByDirectionType],
      [FieldMetadataType.NUMBER, OrderByDirectionType],
      [FieldMetadataType.NUMERIC, OrderByDirectionType],
      [FieldMetadataType.RATING, OrderByDirectionType],
      [FieldMetadataType.SELECT, OrderByDirectionType],
      [FieldMetadataType.MULTI_SELECT, OrderByDirectionType],
      [FieldMetadataType.POSITION, OrderByDirectionType],
      [FieldMetadataType.RAW_JSON, OrderByDirectionType],
      [FieldMetadataType.RICH_TEXT, OrderByDirectionType],
      [FieldMetadataType.ARRAY, OrderByDirectionType],
      [FieldMetadataType.TS_VECTOR, OrderByDirectionType], // TODO: Add TSVectorOrderByType
    ]);

    return typeOrderByMapping.get(fieldMetadataType);
  }

  mapToOrderByWithGroupByType(
    aggregationType: AggregateOperations,
  ): GraphQLInputType | undefined {
    const typeOrderByMapping = new Map<AggregateOperations, GraphQLInputType>([
      [AggregateOperations.SUM, OrderByDirectionType],
      [AggregateOperations.COUNT, OrderByDirectionType],
      [AggregateOperations.COUNT_UNIQUE_VALUES, OrderByDirectionType],
      [AggregateOperations.COUNT_EMPTY, OrderByDirectionType],
      [AggregateOperations.COUNT_NOT_EMPTY, OrderByDirectionType],
      [AggregateOperations.COUNT_TRUE, OrderByDirectionType],
      [AggregateOperations.COUNT_FALSE, OrderByDirectionType],
      [AggregateOperations.PERCENTAGE_EMPTY, OrderByDirectionType],
      [AggregateOperations.PERCENTAGE_NOT_EMPTY, OrderByDirectionType],
      [AggregateOperations.MIN, OrderByDirectionType],
      [AggregateOperations.MAX, OrderByDirectionType],
      [AggregateOperations.AVG, OrderByDirectionType],
    ]);

    return typeOrderByMapping.get(aggregationType);
  }

  applyTypeOptions<T extends GraphQLType = GraphQLType>(
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

    if (options.nullable === false && !isDefined(options.defaultValue)) {
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
