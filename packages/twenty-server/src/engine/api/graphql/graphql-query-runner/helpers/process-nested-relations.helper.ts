import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { type FindOptionsRelations, type ObjectLiteral } from 'typeorm';

import { ProcessNestedRelationsV2Helper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations-v2.helper';
import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { type WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';

@Injectable()
export class ProcessNestedRelationsHelper {
  constructor(
    private readonly processNestedRelationsV2Helper: ProcessNestedRelationsV2Helper,
  ) {}

  public async processNestedRelations<T extends ObjectRecord = ObjectRecord>({
    objectMetadataMaps,
    parentObjectMetadataItem,
    parentObjectRecords,
    parentObjectRecordsAggregatedValues = {},
    relations,
    aggregate = {},
    limit,
    authContext,
    workspaceDataSource,
    shouldBypassPermissionChecks,
    roleId,
    selectedFields,
  }: {
    objectMetadataMaps: ObjectMetadataMaps;
    parentObjectMetadataItem: ObjectMetadataItemWithFieldMaps;
    parentObjectRecords: T[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parentObjectRecordsAggregatedValues?: Record<string, any>;
    relations: Record<string, FindOptionsRelations<ObjectLiteral>>;
    aggregate?: Record<string, AggregationField>;
    limit: number;
    authContext: AuthContext;
    workspaceDataSource: WorkspaceDataSource;
    shouldBypassPermissionChecks: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedFields: Record<string, any>;
    roleId?: string;
  }): Promise<void> {
    return this.processNestedRelationsV2Helper.processNestedRelations({
      objectMetadataMaps,
      parentObjectMetadataItem,
      parentObjectRecords,
      parentObjectRecordsAggregatedValues,
      relations,
      aggregate,
      limit,
      authContext,
      workspaceDataSource,
      shouldBypassPermissionChecks,
      roleId,
      selectedFields,
    });
  }
}
