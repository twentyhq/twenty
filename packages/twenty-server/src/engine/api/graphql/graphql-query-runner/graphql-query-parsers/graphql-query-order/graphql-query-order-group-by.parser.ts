import { isObject } from 'class-validator';
import {
  type AggregateOrderByWithGroupByField,
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForRelationField,
  type ObjectRecordOrderByForScalarField,
  type ObjectRecordOrderByWithGroupByDateField,
  OrderByDirection,
  type OrderByWithGroupBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type GroupByDateField,
  type GroupByField,
  type GroupByRegularField,
} from 'src/engine/api/common/common-query-runners/types/group-by-field.types';
import { getGroupByOrderExpression } from 'src/engine/api/common/common-query-runners/utils/get-group-by-order-expression.util';
import { convertOrderByToFindOptionsOrder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/convert-order-by-to-find-options-order';
import { getOptionalOrderByCasting } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/get-optional-order-by-casting.util';
import { parseCompositeFieldForOrder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/parse-composite-field-for-order.util';
import { prepareForOrderByRelationFieldParsing } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/prepare-for-order-by-relation-field-parsing.util';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import {
  type AggregationField,
  getAvailableAggregationsFromObjectFields,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { formatColumnNamesFromCompositeFieldAndSubfields } from 'src/engine/twenty-orm/utils/format-column-names-from-composite-field-and-subfield.util';

import { type OrderByClause } from './types/order-by-condition.type';

export class GraphqlQueryOrderGroupByParser {
  private flatObjectMetadata: FlatObjectMetadata;
  private flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  private flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  private fieldIdByName: Record<string, string>;

  constructor(
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ) {
    this.flatObjectMetadata = flatObjectMetadata;
    this.flatObjectMetadataMaps = flatObjectMetadataMaps;
    this.flatFieldMetadataMaps = flatFieldMetadataMaps;

    const fieldMaps = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    this.fieldIdByName = fieldMaps.fieldIdByName;
  }

  parse({
    orderBy,
    groupByFields,
  }: {
    orderBy: OrderByWithGroupBy;
    groupByFields: GroupByField[];
  }): Record<string, OrderByClause>[] {
    const parsedOrderBy: Record<string, OrderByClause>[] = [];

    const fields = findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityIds: this.flatObjectMetadata.fieldIds,
      flatEntityMaps: this.flatFieldMetadataMaps,
    });

    const availableAggregations: Record<string, AggregationField> =
      getAvailableAggregationsFromObjectFields(fields);

    for (const orderByArg of orderBy) {
      if (this.isAggregateOrderByArg(orderByArg)) {
        const parsedAggregateOrderBy = this.parseAggregateOrderByArg(
          availableAggregations,
          orderByArg,
          this.flatObjectMetadata,
        );

        parsedOrderBy.push(parsedAggregateOrderBy);
        continue;
      }

      if (Object.keys(orderByArg).length > 1) {
        throw new UserInputError(
          'Please provide orderBy field criteria one by one in orderBy array',
        );
      }

      const fieldName = Object.keys(orderByArg)[0];
      const fieldMetadataId = this.fieldIdByName[fieldName];
      const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: this.flatFieldMetadataMaps,
      });

      if (!isDefined(fieldMetadata)) {
        throw new UserInputError(`Cannot orderBy unknown field: ${fieldName}.`);
      }

      if (this.isObjectRecordOrderByForScalarField(orderByArg)) {
        const parsedOrderByForScalarField =
          this.parseObjectRecordOrderByForScalarField({
            groupByFields,
            orderByArg,
            flatObjectMetadata: this.flatObjectMetadata,
            fieldMetadata,
          });

        if (!isDefined(parsedOrderByForScalarField)) {
          continue;
        }

        parsedOrderBy.push(parsedOrderByForScalarField);
        continue;
      }

      if (
        this.isObjectRecordOrderByWithGroupByDateField(
          orderByArg,
          fieldMetadata.type,
        )
      ) {
        const parsedOrderByForGroupByDateField =
          this.parseObjectRecordOrderByWithGroupByDateField({
            groupByFields,
            orderByArg,
            fieldMetadataId,
          });

        if (!isDefined(parsedOrderByForGroupByDateField)) {
          continue;
        }

        parsedOrderBy.push(parsedOrderByForGroupByDateField);
        continue;
      }

      if (
        this.isObjectRecordOrderByForRelationField(orderByArg, fieldMetadata)
      ) {
        const parsedOrderByForRelationField =
          this.parseObjectRecordOrderByForRelationField({
            groupByFields,
            orderByArg,
            fieldMetadata,
          });

        if (!isDefined(parsedOrderByForRelationField)) {
          continue;
        }

        parsedOrderBy.push(parsedOrderByForRelationField);
        continue;
      }

      if (this.isObjectRecordOrderByForCompositeField(orderByArg)) {
        const parsedOrderByForCompositeField =
          this.parseObjectRecordOrderByForCompositeField({
            groupByFields,
            orderByArg,
            flatObjectMetadata: this.flatObjectMetadata,
            fieldMetadata,
          });

        if (!isDefined(parsedOrderByForCompositeField)) {
          continue;
        }

        parsedOrderBy.push(parsedOrderByForCompositeField);
        continue;
      }

      throw new UserInputError(`Unknown orderBy value: ${orderByArg}`);
    }

    return parsedOrderBy;
  }

  private isAggregateOrderByArg = (
    orderByArg:
      | ObjectRecordOrderByForScalarField
      | ObjectRecordOrderByForCompositeField
      | AggregateOrderByWithGroupByField
      | ObjectRecordOrderByWithGroupByDateField
      | ObjectRecordOrderByForRelationField,
  ): orderByArg is AggregateOrderByWithGroupByField => {
    return isDefined(orderByArg.aggregate);
  };

  private isObjectRecordOrderByForScalarField = (
    orderByArg:
      | ObjectRecordOrderByForScalarField
      | ObjectRecordOrderByForCompositeField
      | ObjectRecordOrderByWithGroupByDateField
      | ObjectRecordOrderByForRelationField,
  ): orderByArg is ObjectRecordOrderByForScalarField => {
    if (Object.keys(orderByArg).length > 1) {
      throw new UserInputError(
        'Please provide orderBy field criteria one by one in orderBy array',
      );
    }

    const scalarFieldOrCompositeFieldOrderByValue =
      Object.values(orderByArg)[0];

    if (
      Object.values(OrderByDirection).includes(
        scalarFieldOrCompositeFieldOrderByValue,
      )
    ) {
      return true;
    }

    return false;
  };

  private isObjectRecordOrderByForCompositeField = (
    orderByArg:
      | ObjectRecordOrderByForScalarField
      | ObjectRecordOrderByForCompositeField
      | ObjectRecordOrderByWithGroupByDateField
      | ObjectRecordOrderByForRelationField,
  ): orderByArg is ObjectRecordOrderByForCompositeField => {
    const compositeFieldOrderByValue = Object.values(orderByArg)[0];

    if (!isObject(compositeFieldOrderByValue)) {
      throw new UserInputError(
        `Unknown orderBy value: ${compositeFieldOrderByValue}`,
      );
    }

    if (Object.values(compositeFieldOrderByValue).length > 1) {
      throw new UserInputError(
        'Please provide orderBy field criteria one by one in orderBy array',
      );
    }

    const compositeFieldOrderByDirection = Object.values(
      compositeFieldOrderByValue,
    )[0];

    if (
      Object.values(OrderByDirection).includes(
        compositeFieldOrderByDirection as OrderByDirection,
      )
    ) {
      return true;
    }

    return false;
  };

  private isObjectRecordOrderByWithGroupByDateField = (
    orderByArg:
      | ObjectRecordOrderByForScalarField
      | ObjectRecordOrderByForCompositeField
      | AggregateOrderByWithGroupByField
      | ObjectRecordOrderByWithGroupByDateField
      | ObjectRecordOrderByForRelationField,
    fieldMetadataType: FieldMetadataType,
  ): orderByArg is ObjectRecordOrderByWithGroupByDateField => {
    if (
      fieldMetadataType !== FieldMetadataType.DATE &&
      fieldMetadataType !== FieldMetadataType.DATE_TIME
    ) {
      return false;
    }

    if (Object.keys(orderByArg).length > 1) {
      throw new UserInputError(
        'Please provide orderBy field criteria one by one in orderBy array',
      );
    }

    const dateFieldOrderByValue = Object.values(orderByArg)[0];

    if (!isDefined(dateFieldOrderByValue)) {
      return false;
    }

    if (!isDefined(dateFieldOrderByValue.orderBy)) {
      return false;
    }

    if (
      !Object.values(OrderByDirection).includes(dateFieldOrderByValue.orderBy)
    ) {
      return false;
    }

    if (!isDefined(dateFieldOrderByValue.granularity)) {
      return false;
    }

    if (
      !Object.values(ObjectRecordGroupByDateGranularity).includes(
        dateFieldOrderByValue.granularity,
      )
    ) {
      return false;
    }

    return true;
  };

  private isObjectRecordOrderByForRelationField = (
    orderByArg:
      | ObjectRecordOrderByForScalarField
      | ObjectRecordOrderByForCompositeField
      | ObjectRecordOrderByWithGroupByDateField
      | ObjectRecordOrderByForRelationField,
    fieldMetadata: FlatFieldMetadata,
  ): orderByArg is ObjectRecordOrderByForRelationField => {
    if (!isMorphOrRelationFlatFieldMetadata(fieldMetadata)) {
      return false;
    }

    const relationFieldOrderByValue = Object.values(orderByArg)[0];

    if (!isObject(relationFieldOrderByValue)) {
      return false;
    }

    return Object.keys(relationFieldOrderByValue).length > 0;
  };

  private parseAggregateOrderByArg = (
    availableAggregations: Record<string, AggregationField>,
    orderByArg: AggregateOrderByWithGroupByField,
    flatObjectMetadata: FlatObjectMetadata,
  ): Record<string, OrderByClause> => {
    const aggregate = orderByArg.aggregate;

    if (Object.keys(aggregate).length > 1) {
      throw new UserInputError(
        'Please provide aggregate criteria one by one in orderBy array',
      );
    }

    const aggregateField = availableAggregations[Object.keys(aggregate)[0]];

    if (!aggregateField) {
      throw new UserInputError(
        `Unknown aggregate field: ${Object.keys(aggregate)[0]}`,
      );
    }

    const aggregateExpression = ProcessAggregateHelper.getAggregateExpression(
      aggregateField,
      flatObjectMetadata.nameSingular,
    );

    if (!isDefined(aggregateExpression)) {
      throw new UserInputError(
        `Cannot find expression for aggregate field: ${Object.keys(aggregate)[0]}`,
      );
    }
    const orderByDirection = Object.values(aggregate)[0];
    const convertedDirection =
      convertOrderByToFindOptionsOrder(orderByDirection);

    return {
      [aggregateExpression]: convertedDirection,
    };
  };

  private parseObjectRecordOrderByForScalarField = ({
    groupByFields,
    orderByArg,
    flatObjectMetadata,
    fieldMetadata,
  }: {
    groupByFields: GroupByField[];
    orderByArg: ObjectRecordOrderByForScalarField;
    flatObjectMetadata: FlatObjectMetadata;
    fieldMetadata: FlatFieldMetadata;
  }): Record<string, OrderByClause> | null => {
    const groupByField = groupByFields.find(
      (groupByField) => groupByField.fieldMetadata.id === fieldMetadata.id,
    );

    if (!isDefined(groupByField)) {
      throw new UserInputError(
        `Cannot order by a field that is not an aggregate nor in groupBy criteria: ${fieldMetadata.name}.`,
      );
    }

    const orderByCasting = getOptionalOrderByCasting(fieldMetadata);
    const orderByDirection = Object.values(orderByArg)[0];

    if (!isDefined(orderByDirection)) {
      return null;
    }

    const columnNameWithQuotes = `"${flatObjectMetadata.nameSingular}"."${fieldMetadata.name}"`;

    const expression = getGroupByOrderExpression({
      groupByField,
      columnNameWithQuotes,
    });

    return {
      [`${expression}${orderByCasting}`]:
        convertOrderByToFindOptionsOrder(orderByDirection),
    };
  };

  private parseObjectRecordOrderByForCompositeField = ({
    groupByFields,
    orderByArg,
    flatObjectMetadata,
    fieldMetadata,
  }: {
    groupByFields: GroupByField[];
    orderByArg: ObjectRecordOrderByForCompositeField;
    flatObjectMetadata: FlatObjectMetadata;
    fieldMetadata: FlatFieldMetadata;
  }): Record<string, OrderByClause> | null => {
    const fieldName = Object.keys(orderByArg)[0];
    const orderBySubField = orderByArg[fieldName];

    if (!isDefined(orderBySubField)) {
      return null;
    }

    if (Object.keys(orderBySubField).length > 1) {
      throw new UserInputError(
        `Subfields must be provided one by one in orderBy array.`,
      );
    }

    const subFieldName = Object.keys(orderBySubField)[0];

    if (
      !groupByFields.some(
        (groupByField) =>
          groupByField.fieldMetadata.id === fieldMetadata.id &&
          (groupByField as GroupByRegularField).subFieldName === subFieldName,
      )
    ) {
      throw new UserInputError(
        `Cannot order by a field that is not in groupBy or that is not an aggregate field: ${subFieldName}`,
      );
    }

    return parseCompositeFieldForOrder(
      fieldMetadata,
      orderBySubField,
      flatObjectMetadata.nameSingular,
    );
  };

  private parseObjectRecordOrderByWithGroupByDateField = ({
    groupByFields,
    orderByArg,
    fieldMetadataId,
  }: {
    groupByFields: GroupByField[];
    orderByArg: ObjectRecordOrderByWithGroupByDateField;
    fieldMetadataId: string;
  }): Record<string, OrderByClause> | null => {
    const orderByDirection = Object.values(orderByArg)[0]?.orderBy;

    if (!isDefined(orderByDirection)) {
      return null;
    }

    const granularity = Object.values(orderByArg)[0]?.granularity;

    if (!isDefined(granularity)) {
      throw new UserInputError(
        `Missing date granularity for field ${Object.keys(orderByArg)[0]}`,
      );
    }

    const associatedGroupByField = groupByFields.find(
      (groupByField) =>
        groupByField.fieldMetadata.id === fieldMetadataId &&
        (groupByField as GroupByDateField).dateGranularity === granularity,
    ) as GroupByDateField | undefined;

    if (!isDefined(associatedGroupByField)) {
      throw new UserInputError(
        `Cannot order by a date granularity that is not in groupBy criteria: ${granularity}`,
      );
    }

    const columnNameWithQuotes = `"${
      formatColumnNamesFromCompositeFieldAndSubfields(
        associatedGroupByField.fieldMetadata.name,
        associatedGroupByField.subFieldName
          ? [associatedGroupByField.subFieldName]
          : undefined,
      )[0]
    }"`;

    const expression = getGroupByOrderExpression({
      groupByField: associatedGroupByField,
      columnNameWithQuotes,
    });

    return {
      [expression]: convertOrderByToFindOptionsOrder(orderByDirection),
    };
  };

  private parseObjectRecordOrderByForRelationField = ({
    groupByFields,
    orderByArg,
    fieldMetadata,
  }: {
    groupByFields: GroupByField[];
    orderByArg: ObjectRecordOrderByForRelationField;
    fieldMetadata: FlatFieldMetadata;
  }): Record<string, OrderByClause> | null => {
    const {
      associatedGroupByField,
      nestedFieldMetadata,
      nestedFieldOrderByValue,
    } = prepareForOrderByRelationFieldParsing({
      orderByArg,
      fieldMetadata,
      flatObjectMetadataMaps: this.flatObjectMetadataMaps,
      flatFieldMetadataMaps: this.flatFieldMetadataMaps,
      groupByFields,
    });

    if (
      !isDefined(associatedGroupByField) ||
      !isDefined(nestedFieldMetadata) ||
      !isDefined(nestedFieldOrderByValue)
    ) {
      return null;
    }

    // Handle composite fields
    if (isCompositeFieldMetadataType(nestedFieldMetadata.type)) {
      if (!isObject(nestedFieldOrderByValue)) {
        throw new UserInputError(
          `Composite field "${nestedFieldMetadata.name}" requires a subfield to be specified`,
        );
      }

      const compositeSubFields = Object.keys(nestedFieldOrderByValue);

      if (compositeSubFields.length > 1) {
        throw new UserInputError(
          'Please provide composite subfield criteria one by one in orderBy array',
        );
      }

      const nestedSubFieldName = compositeSubFields[0];
      const orderByDirection = (
        nestedFieldOrderByValue as Record<string, OrderByDirection>
      )[nestedSubFieldName];

      if (!isDefined(orderByDirection)) {
        return null;
      }

      if (
        !isDefined(associatedGroupByField.nestedSubFieldName) ||
        associatedGroupByField.nestedSubFieldName !== nestedSubFieldName
      ) {
        throw new UserInputError(
          `Cannot order by a composite subfield that is not in groupBy criteria: ${nestedSubFieldName}`,
        );
      }

      const joinAlias = fieldMetadata.name;
      const nestedColumnName = formatColumnNamesFromCompositeFieldAndSubfields(
        nestedFieldMetadata.name,
        [nestedSubFieldName],
      )[0];

      const columnNameWithQuotes = `"${joinAlias}"."${nestedColumnName}"`;

      return {
        [columnNameWithQuotes]:
          convertOrderByToFindOptionsOrder(orderByDirection),
      };
    }

    const isGroupByDateField =
      (nestedFieldMetadata.type === FieldMetadataType.DATE ||
        nestedFieldMetadata.type === FieldMetadataType.DATE_TIME) &&
      isObject(nestedFieldOrderByValue) &&
      'orderBy' in nestedFieldOrderByValue &&
      'granularity' in nestedFieldOrderByValue;

    if (isGroupByDateField) {
      const orderByDirection = (
        nestedFieldOrderByValue as {
          orderBy: OrderByDirection;
          granularity: ObjectRecordGroupByDateGranularity;
        }
      ).orderBy;
      const granularity = (
        nestedFieldOrderByValue as {
          orderBy: OrderByDirection;
          granularity: ObjectRecordGroupByDateGranularity;
        }
      ).granularity;

      if (
        !isDefined(associatedGroupByField.dateGranularity) ||
        associatedGroupByField.dateGranularity !== granularity
      ) {
        throw new UserInputError(
          `Cannot order by a date granularity that is not in groupBy criteria: ${granularity}`,
        );
      }

      const joinAlias = fieldMetadata.name;
      const nestedColumnName = formatColumnNamesFromCompositeFieldAndSubfields(
        nestedFieldMetadata.name,
        associatedGroupByField.nestedSubFieldName
          ? [associatedGroupByField.nestedSubFieldName]
          : undefined,
      )[0];

      const columnNameWithQuotes = `"${joinAlias}"."${nestedColumnName}"`;

      const expression = getGroupByOrderExpression({
        groupByField: associatedGroupByField,
        columnNameWithQuotes,
      });

      return {
        [expression]: convertOrderByToFindOptionsOrder(orderByDirection),
      };
    }

    // Handle regular nested fields
    if (
      typeof nestedFieldOrderByValue === 'string' &&
      Object.values(OrderByDirection).includes(
        nestedFieldOrderByValue as OrderByDirection,
      )
    ) {
      const orderByDirection = nestedFieldOrderByValue as OrderByDirection;

      const joinAlias = fieldMetadata.name;
      const nestedColumnName = formatColumnNamesFromCompositeFieldAndSubfields(
        nestedFieldMetadata.name,
        associatedGroupByField.nestedSubFieldName
          ? [associatedGroupByField.nestedSubFieldName]
          : undefined,
      )[0];

      const columnNameWithQuotes = `"${joinAlias}"."${nestedColumnName}"`;

      return {
        [columnNameWithQuotes]:
          convertOrderByToFindOptionsOrder(orderByDirection),
      };
    }

    return null;
  };
}
