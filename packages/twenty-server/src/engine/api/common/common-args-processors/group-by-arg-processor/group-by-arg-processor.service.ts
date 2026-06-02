import { Injectable } from '@nestjs/common';
import {
  AggregateOperations,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type GroupByField } from 'src/engine/api/common/common-query-runners/types/group-by-field.types';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { validateAndTransformGroupByFieldsOrThrow } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/utils/validate-and-transform-group-by-fields-or-throw.util';
import {
  type AggregationField,
  getAvailableAggregationsFromObjectFields,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import {
  ObjectRecordGroupByForAtomicField,
  ObjectRecordGroupByForCompositeField,
  ObjectRecordGroupByForDateField,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveAggregateFieldKey } from 'src/engine/core-modules/record-crud/utils/resolve-aggregate-field-key.util';

@Injectable()
export class GroupByArgProcessorService {
  process({
    groupBy,
  }: {
    groupBy:
      | ObjectRecordGroupByForAtomicField
      | ObjectRecordGroupByForCompositeField
      | ObjectRecordGroupByForDateField
      | Array<
          | ObjectRecordGroupByForAtomicField
          | ObjectRecordGroupByForCompositeField
          | ObjectRecordGroupByForDateField
        >;
  }): Array<
    | ObjectRecordGroupByForAtomicField
    | ObjectRecordGroupByForCompositeField
    | ObjectRecordGroupByForDateField
  > {
    if (Array.isArray(groupBy)) {
      return groupBy;
    }

    return [groupBy];
  }

  validateAndTransformGroupByFieldsOrThrow({
    groupBy,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    groupBy: Array<
      | ObjectRecordGroupByForAtomicField
      | ObjectRecordGroupByForCompositeField
      | ObjectRecordGroupByForDateField
    >;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): GroupByField[] {
    return validateAndTransformGroupByFieldsOrThrow({
      groupBy,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  getAvailableAggregations({
    flatObjectMetadata,
    flatFieldMetadataMaps,
    restrictedFields,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    restrictedFields?: RestrictedFieldsPermissions;
  }): Record<string, AggregationField> {
    const objectFields = findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityIds: flatObjectMetadata.fieldIds,
      flatEntityMaps: flatFieldMetadataMaps,
    }).filter((field) => restrictedFields?.[field.id]?.canRead !== false);

    return getAvailableAggregationsFromObjectFields(objectFields);
  }

  validateAggregateFieldKeysOrThrow({
    aggregateFieldKeys,
    availableAggregations,
  }: {
    aggregateFieldKeys: string[];
    availableAggregations: Record<string, AggregationField>;
  }): void {
    const invalidAggregateFieldKeys = aggregateFieldKeys.filter(
      (aggregateFieldKey) =>
        !isDefined(availableAggregations[aggregateFieldKey]),
    );

    if (invalidAggregateFieldKeys.length === 0) {
      return;
    }

    throw new CommonQueryRunnerException(
      `Unknown aggregate field(s): ${invalidAggregateFieldKeys.join(', ')}`,
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  resolveToolAggregateFieldKeyOrThrow({
    aggregateOperation,
    aggregateFieldName,
    availableAggregations,
  }: {
    aggregateOperation: keyof typeof AggregateOperations;
    aggregateFieldName?: string;
    availableAggregations: Record<string, AggregationField>;
  }): string {
    if (aggregateOperation === AggregateOperations.COUNT) {
      if (aggregateFieldName) {
        throw new CommonQueryRunnerException(
          'aggregateFieldName is not supported for COUNT operation',
          CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      return 'totalCount';
    }

    if (!aggregateFieldName) {
      throw new CommonQueryRunnerException(
        `aggregateFieldName is required for ${aggregateOperation} operation`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const aggregateFieldKey = resolveAggregateFieldKey(
      aggregateOperation,
      aggregateFieldName,
      availableAggregations,
    );

    if (!aggregateFieldKey) {
      throw new CommonQueryRunnerException(
        `No aggregation available for ${aggregateOperation} on field "${aggregateFieldName}"`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    return aggregateFieldKey;
  }
}
