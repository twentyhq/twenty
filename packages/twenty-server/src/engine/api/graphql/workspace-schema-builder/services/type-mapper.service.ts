import { Injectable } from '@nestjs/common';
import { GraphQLISODateTime } from '@nestjs/graphql';

import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLString,
  GraphQLType,
} from 'graphql';
import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

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
import { IDFilterType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/id-filter.input-type';
import { MultiSelectFilterType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/multi-select-filter.input-type';
import { SelectFilterType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/select-filter.input-type';
import {
  BigFloatScalarType,
  UUIDScalarType,
} from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PositionScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars/position.scalar';
import { RawJSONScalar } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars/raw-json.scalar';
import { getNumberFilterType } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-number-filter-type.util';
import { getNumberScalarType } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-number-scalar-type.util';

export interface TypeOptions<T = any> {
  nullable?: boolean;
  isArray?: boolean;
  arrayDepth?: number;
  defaultValue?: T;
  settings?: FieldMetadataSettings<FieldMetadataType | 'default'>;
  isIdField?: boolean;
}

const StringArrayScalarType = new GraphQLList(GraphQLString);

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
    const typeScalarMapping = new Map<FieldMetadataType, GraphQLScalarType>([
      [FieldMetadataType.UUID, UUIDScalarType],
      [FieldMetadataType.TEXT, GraphQLString],
      [FieldMetadataType.DATE_TIME, GraphQLISODateTime],
      [FieldMetadataType.DATE, GraphQLISODateTime],
      [FieldMetadataType.BOOLEAN, GraphQLBoolean],
      [
        FieldMetadataType.NUMBER,
        getNumberScalarType(
          (settings as FieldMetadataSettings<FieldMetadataType.NUMBER>)
            ?.dataType,
        ),
      ],
      [FieldMetadataType.NUMERIC, BigFloatScalarType],
      [FieldMetadataType.POSITION, PositionScalarType],
      [FieldMetadataType.RAW_JSON, RawJSONScalar],
      [
        FieldMetadataType.ARRAY,
        StringArrayScalarType as unknown as GraphQLScalarType,
      ],
      [FieldMetadataType.RICH_TEXT, GraphQLString],
      [FieldMetadataType.TS_VECTOR, GraphQLString],
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

    const typeFilterMapping = new Map<
      FieldMetadataType,
      GraphQLInputObjectType | GraphQLScalarType
    >([
      [FieldMetadataType.UUID, IDFilterType],
      [FieldMetadataType.TEXT, StringFilterType],
      [FieldMetadataType.DATE_TIME, DateFilterType],
      [FieldMetadataType.DATE, DateFilterType],
      [FieldMetadataType.BOOLEAN, BooleanFilterType],
      [
        FieldMetadataType.NUMBER,
        getNumberFilterType(
          (settings as FieldMetadataSettings<FieldMetadataType.NUMBER>)
            ?.dataType,
        ),
      ],
      [FieldMetadataType.NUMERIC, BigFloatFilterType],
      [FieldMetadataType.POSITION, FloatFilterType],
      [FieldMetadataType.RAW_JSON, RawJsonFilterType],
      [FieldMetadataType.RICH_TEXT, StringFilterType],
      [FieldMetadataType.ARRAY, ArrayFilterType],
      [FieldMetadataType.MULTI_SELECT, MultiSelectFilterType],
      [FieldMetadataType.SELECT, SelectFilterType],
      [FieldMetadataType.TS_VECTOR, StringFilterType], // TODO: Add TSVectorFilterType
    ]);

    return typeFilterMapping.get(fieldMetadataType);
  }

  mapToOrderByType(
    fieldMetadataType: FieldMetadataType,
  ): GraphQLInputType | undefined {
    const typeOrderByMapping = new Map<FieldMetadataType, GraphQLEnumType>([
      [FieldMetadataType.UUID, OrderByDirectionType],
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
