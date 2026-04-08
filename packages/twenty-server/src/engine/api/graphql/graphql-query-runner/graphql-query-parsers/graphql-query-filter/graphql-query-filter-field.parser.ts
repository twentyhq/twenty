import { randomBytes } from 'crypto';

import { msg } from '@lingui/core/macro';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { type WhereExpressionBuilder } from 'typeorm';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { computeWhereConditionParts } from 'src/engine/api/graphql/graphql-query-runner/utils/compute-where-condition-parts';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const ARRAY_OPERATORS = ['in', 'contains', 'notContains'];

export class GraphqlQueryFilterFieldParser {
  private flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  private fieldIdByName: Record<string, string>;
  private fieldIdByJoinColumnName: Record<string, string>;

  constructor(
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ) {
    this.flatFieldMetadataMaps = flatFieldMetadataMaps;

    const fieldMaps = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    this.fieldIdByName = fieldMaps.fieldIdByName;
    this.fieldIdByJoinColumnName = fieldMaps.fieldIdByJoinColumnName;
  }

  public parse(
    queryBuilder: WhereExpressionBuilder,
    objectNameSingular: string,
    key: string,
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    filterValue: any,
    isFirst = false,
    useDirectTableReference = false,
    workspaceId?: string,
    workspaceFlatObjectMetadataMaps?: FlatEntityMaps<FlatObjectMetadata>,
    workspaceFlatFieldMetadataMaps?: FlatEntityMaps<FlatFieldMetadata>,
  ): void {
    const fieldMetadataId =
      this.fieldIdByName[`${key}`] || this.fieldIdByJoinColumnName[`${key}`];

    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: this.flatFieldMetadataMaps,
    });

    if (!isDefined(fieldMetadata)) {
      throw new Error(`Field metadata not found for field: ${key}`);
    }

    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      return this.parseCompositeFieldForFilter(
        queryBuilder,
        fieldMetadata,
        objectNameSingular,
        filterValue,
        isFirst,
        useDirectTableReference,
      );
    }

    // Junction (many-to-many) relation filter: uses 'some' or 'none' operators
    if (
      isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION) &&
      isDefined(
        (fieldMetadata.settings as Record<string, unknown> | null)
          ?.junctionTargetFieldId,
      ) &&
      isDefined(workspaceId) &&
      isDefined(workspaceFlatObjectMetadataMaps) &&
      isDefined(workspaceFlatFieldMetadataMaps)
    ) {
      const [[junctionOperator, junctionValue]] = Object.entries(filterValue);

      if (junctionOperator === 'some' || junctionOperator === 'none') {
        return this.parseJunctionRelationForFilter(
          queryBuilder,
          objectNameSingular,
          fieldMetadata,
          junctionOperator,
          junctionValue,
          isFirst,
          workspaceId,
          workspaceFlatObjectMetadataMaps,
          workspaceFlatFieldMetadataMaps,
        );
      }
    }

    const [[operator, value]] = Object.entries(filterValue);

    if (
      ARRAY_OPERATORS.includes(operator) &&
      (!Array.isArray(value) || value.length === 0)
    ) {
      throw new GraphqlQueryRunnerException(
        `Invalid filter value for field ${key}. Expected non-empty array`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: msg`Invalid filter value: "${value}"` },
      );
    }
    const { sql, params } = computeWhereConditionParts({
      operator,
      objectNameSingular,
      key,
      value,
      fieldMetadataType: fieldMetadata.type,
      useDirectTableReference,
    });

    if (isFirst) {
      queryBuilder.where(sql, params);
    } else {
      queryBuilder.andWhere(sql, params);
    }
  }

  private parseJunctionRelationForFilter(
    queryBuilder: WhereExpressionBuilder,
    objectNameSingular: string,
    fieldMetadata: FlatFieldMetadata,
    operator: 'some' | 'none',
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    operatorValue: any,
    isFirst: boolean,
    workspaceId: string,
    workspaceFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    workspaceFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): void {
    const settings = fieldMetadata.settings as {
      junctionTargetFieldId: string;
    };
    const junctionTargetFieldId = settings.junctionTargetFieldId;

    const junctionObject = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadata.relationTargetObjectMetadataId as string,
      flatEntityMaps: workspaceFlatObjectMetadataMaps,
    });

    if (!isDefined(junctionObject)) {
      throw new Error(
        `Junction object not found for field: ${fieldMetadata.name}`,
      );
    }

    const targetField = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: junctionTargetFieldId,
      flatEntityMaps: workspaceFlatFieldMetadataMaps,
    });

    if (!isDefined(targetField)) {
      throw new Error(
        `Junction target field not found: ${junctionTargetFieldId}`,
      );
    }

    const allJunctionFields = getFlatFieldsFromFlatObjectMetadata(
      junctionObject,
      workspaceFlatFieldMetadataMaps,
    );

    const junctionSourceFields = allJunctionFields.filter(
      (f) =>
        isFlatFieldMetadataOfType(f, FieldMetadataType.RELATION) &&
        (f.settings as Record<string, unknown> | null)?.relationType ===
          RelationType.MANY_TO_ONE &&
        f.id !== junctionTargetFieldId,
    );

    if (junctionSourceFields.length === 0) {
      throw new Error(
        `Cannot find source field in junction object: ${junctionObject.nameSingular}`,
      );
    }

    const sourceField = junctionSourceFields[0];
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const junctionTableName = junctionObject.nameSingular;
    const sourceColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: sourceField.name,
    });
    const targetColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: targetField.name,
    });
    const alias = `j_${randomBytes(4).toString('hex')}`;
    const paramSuffix = randomBytes(5).toString('hex');

    let sql: string;
    let params: Record<string, unknown> = {};

    if (operator === 'some') {
      const recordIds = operatorValue?.in;

      if (!Array.isArray(recordIds) || recordIds.length === 0) return;

      sql = `EXISTS (SELECT 1 FROM "${schemaName}"."${junctionTableName}" "${alias}" WHERE "${alias}"."${sourceColumnName}" = "${objectNameSingular}"."id" AND "${alias}"."${targetColumnName}" IN (:...${paramSuffix}))`;
      params = { [paramSuffix]: recordIds };
    } else {
      sql = `NOT EXISTS (SELECT 1 FROM "${schemaName}"."${junctionTableName}" "${alias}" WHERE "${alias}"."${sourceColumnName}" = "${objectNameSingular}"."id")`;
    }

    if (isFirst) {
      queryBuilder.where(sql, params);
    } else {
      queryBuilder.andWhere(sql, params);
    }
  }

  private parseCompositeFieldForFilter(
    queryBuilder: WhereExpressionBuilder,
    fieldMetadata: FlatFieldMetadata,
    objectNameSingular: string,
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    fieldValue: any,
    isFirst = false,
    useDirectTableReference = false,
  ): void {
    const compositeType = compositeTypeDefinitions.get(
      fieldMetadata.type as CompositeFieldMetadataType,
    );

    if (!compositeType) {
      throw new Error(
        `Composite type definition not found for type: ${fieldMetadata.type}`,
      );
    }

    Object.entries(fieldValue).map(([subFieldKey, subFieldFilter], index) => {
      const subFieldMetadata = compositeType.properties.find(
        (property) => property.name === subFieldKey,
      );

      if (!subFieldMetadata) {
        throw new Error(
          `Sub field metadata not found for composite type: ${fieldMetadata.type}`,
        );
      }

      const fullFieldName = `${fieldMetadata.name}${capitalize(subFieldKey)}`;

      const [[operator, value]] = Object.entries(
        // oxlint-disable-next-line @typescripttypescript/no-explicit-any
        subFieldFilter as Record<string, any>,
      );

      if (
        ARRAY_OPERATORS.includes(operator) &&
        (!Array.isArray(value) || value.length === 0)
      ) {
        throw new GraphqlQueryRunnerException(
          `Invalid filter value for field ${subFieldKey}. Expected non-empty array`,
          GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
          { userFriendlyMessage: msg`Invalid filter value: "${value}"` },
        );
      }

      const { sql, params } = computeWhereConditionParts({
        operator,
        objectNameSingular,
        key: fullFieldName,
        subFieldKey,
        value,
        fieldMetadataType: fieldMetadata.type,
        useDirectTableReference,
      });

      if (isFirst && index === 0) {
        queryBuilder.where(sql, params);
      }

      queryBuilder.andWhere(sql, params);
    });
  }
}
