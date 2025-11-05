import { isObject } from 'class-validator';
import {
  type AggregateOrderByWithGroupByField,
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForScalarField,
  type ObjectRecordOrderByWithGroupByDateField,
  OrderByDirection,
  type OrderByWithGroupBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { convertOrderByToFindOptionsOrder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/convert-order-by-to-find-options-order';
import { parseCompositeFieldForOrder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/parse-composite-field-for-order.util';
import {
  type GroupByDateField,
  type GroupByField,
} from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';
import { getGroupByExpression } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/get-group-by-expression.util';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import {
  type AggregationField,
  getAvailableAggregationsFromObjectFields,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { formatColumnNameForRelationField } from 'src/engine/twenty-orm/utils/format-column-name-for-relation-field.util';
import { formatColumnNamesFromCompositeFieldAndSubfields } from 'src/engine/twenty-orm/utils/format-column-names-from-composite-field-and-subfield.util';

export type OrderByCondition = {
  order: 'ASC' | 'DESC';
  nulls?: 'NULLS FIRST' | 'NULLS LAST';
};

export class GraphqlQueryOrderFieldParser {
  private objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;

  constructor(objectMetadataMapItem: ObjectMetadataItemWithFieldMaps) {
    this.objectMetadataMapItem = objectMetadataMapItem;
  }

  parse(
    orderBy: ObjectRecordOrderBy,
    objectNameSingular: string,
    isForwardPagination = true,
  ): Record<string, OrderByCondition> {
    return orderBy.reduce(
      (acc, item) => {
        Object.entries(item).forEach(([fieldName, orderByDirection]) => {
          const fieldMetadataId =
            this.objectMetadataMapItem.fieldIdByName[fieldName] ||
            this.objectMetadataMapItem.fieldIdByJoinColumnName[fieldName];
          const fieldMetadata =
            this.objectMetadataMapItem.fieldsById[fieldMetadataId];

          if (!fieldMetadata || orderByDirection === undefined) {
            throw new GraphqlQueryRunnerException(
              `Field "${fieldName}" does not exist or is not sortable`,
              GraphqlQueryRunnerExceptionCode.FIELD_NOT_FOUND,
            );
          }

          if (isCompositeFieldMetadataType(fieldMetadata.type)) {
            const compositeOrder = parseCompositeFieldForOrder(
              fieldMetadata,
              orderByDirection,
              objectNameSingular,
              isForwardPagination,
            );

            Object.assign(acc, compositeOrder);
          } else {
            const orderByCasting =
              this.getOptionalOrderByCasting(fieldMetadata);

            const columnName = isFieldMetadataRelationOrMorphRelation(
              fieldMetadata,
            )
              ? formatColumnNameForRelationField(
                  fieldMetadata.name,
                  fieldMetadata.settings,
                )
              : fieldName;

            acc[`"${objectNameSingular}"."${columnName}"${orderByCasting}`] =
              convertOrderByToFindOptionsOrder(
                orderByDirection as OrderByDirection,
                isForwardPagination,
              );
          }
        });

        return acc;
      },
      {} as Record<string, OrderByCondition>,
    );
  }

  parseForGroupBy({
    orderBy,
    groupByFields,
  }: {
    orderBy: OrderByWithGroupBy;
    groupByFields: GroupByField[];
  }): Record<string, OrderByCondition>[] {
    let parsedOrderBy: Record<string, OrderByCondition>[] = [];

    const availableAggregations: Record<string, AggregationField> =
      getAvailableAggregationsFromObjectFields(
        Object.values(this.objectMetadataMapItem.fieldsById),
      );

    for (const orderByArg of orderBy) {
      if (this.isAggregateOrderByArg(orderByArg)) {
        const parsedAggregateOrderBy = this.parseAggregateOrderByArg(
          availableAggregations,
          orderByArg,
          this.objectMetadataMapItem,
        );

        parsedOrderBy.push(parsedAggregateOrderBy);
        continue;
      }

      const fieldName = Object.keys(orderByArg)[0];
      const fieldMetadataId =
        this.objectMetadataMapItem.fieldIdByName[fieldName];
      const fieldMetadata =
        this.objectMetadataMapItem.fieldsById[fieldMetadataId];

      if (!isDefined(fieldMetadata)) {
        throw new UserInputError(`Cannot orderBy unknown field: ${fieldName}.`);
      }

      if (this.isObjectRecordOrderByForScalarField(orderByArg)) {
        const parsedOrderByForScalarField =
          this.parseObjectRecordOrderByForScalarField({
            groupByFields,
            orderByArg,
            objectMetadataItemWithFieldMaps: this.objectMetadataMapItem,
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

      if (this.isObjectRecordOrderByForCompositeField(orderByArg)) {
        const parsedOrderByForCompositeField =
          this.parseObjectRecordOrderByForCompositeField({
            groupByFields,
            orderByArg,
            objectMetadataItemWithFieldMaps: this.objectMetadataMapItem,
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

  getOptionalOrderByCasting(
    fieldMetadata: Pick<FieldMetadataEntity, 'type'>,
  ): string {
    if (
      fieldMetadata.type === FieldMetadataType.SELECT ||
      fieldMetadata.type === FieldMetadataType.MULTI_SELECT
    ) {
      return '::text';
    }

    return '';
  }

  isAggregateOrderByArg = (
    orderByArg:
      | ObjectRecordOrderByForScalarField
      | ObjectRecordOrderByForCompositeField
      | AggregateOrderByWithGroupByField
      | ObjectRecordOrderByWithGroupByDateField,
  ): orderByArg is AggregateOrderByWithGroupByField => {
    return isDefined(orderByArg.aggregate);
  };

  isObjectRecordOrderByForScalarField = (
    orderByArg:
      | ObjectRecordOrderByForScalarField
      | ObjectRecordOrderByForCompositeField
      | ObjectRecordOrderByWithGroupByDateField,
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

  isObjectRecordOrderByForCompositeField = (
    orderByArg:
      | ObjectRecordOrderByForScalarField
      | ObjectRecordOrderByForCompositeField
      | ObjectRecordOrderByWithGroupByDateField,
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

  isObjectRecordOrderByWithGroupByDateField = (
    orderByArg:
      | ObjectRecordOrderByForScalarField
      | ObjectRecordOrderByForCompositeField
      | AggregateOrderByWithGroupByField
      | ObjectRecordOrderByWithGroupByDateField,
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

  parseAggregateOrderByArg = (
    availableAggregations: Record<string, AggregationField>,
    orderByArg: AggregateOrderByWithGroupByField,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ): Record<string, OrderByCondition> => {
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
      objectMetadataItemWithFieldMaps.nameSingular,
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

  parseObjectRecordOrderByForScalarField = ({
    groupByFields,
    orderByArg,
    objectMetadataItemWithFieldMaps,
    fieldMetadata,
  }: {
    groupByFields: GroupByField[];
    orderByArg: ObjectRecordOrderByForScalarField;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    fieldMetadata: FieldMetadataEntity;
  }): Record<string, OrderByCondition> | null => {
    const fieldIsInGroupBy = groupByFields.some(
      (groupByField) => groupByField.fieldMetadata.id === fieldMetadata.id,
    );

    if (!fieldIsInGroupBy) {
      throw new UserInputError(
        `Cannot order by a field that is not an aggregate nor in groupBy criteria: ${fieldMetadata.name}.`,
      );
    }

    const orderByCasting = this.getOptionalOrderByCasting(fieldMetadata);
    const orderByDirection = Object.values(orderByArg)[0];

    if (!isDefined(orderByDirection)) {
      return null;
    }

    return {
      [`"${objectMetadataItemWithFieldMaps.nameSingular}"."${fieldMetadata.name}"${orderByCasting}`]:
        convertOrderByToFindOptionsOrder(orderByDirection),
    };
  };

  parseObjectRecordOrderByForCompositeField = ({
    groupByFields,
    orderByArg,
    objectMetadataItemWithFieldMaps,
    fieldMetadata,
  }: {
    groupByFields: GroupByField[];
    orderByArg: ObjectRecordOrderByForCompositeField;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    fieldMetadata: FieldMetadataEntity;
  }): Record<string, OrderByCondition> | null => {
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
          groupByField.subFieldName === subFieldName,
      )
    ) {
      throw new UserInputError(
        `Cannot order by a field that is not in groupBy or that is not an aggregate field: ${subFieldName}`,
      );
    }

    return parseCompositeFieldForOrder(
      fieldMetadata,
      orderBySubField,
      objectMetadataItemWithFieldMaps.nameSingular,
    );
  };

  parseObjectRecordOrderByWithGroupByDateField = ({
    groupByFields,
    orderByArg,
    fieldMetadataId,
  }: {
    groupByFields: GroupByField[];
    orderByArg: ObjectRecordOrderByWithGroupByDateField;
    fieldMetadataId: string;
  }): Record<string, OrderByCondition> | null => {
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
    );

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

    const expression = getGroupByExpression({
      groupByField: associatedGroupByField,
      columnNameWithQuotes,
    });

    return {
      [expression]: convertOrderByToFindOptionsOrder(orderByDirection),
    };
  };
}
