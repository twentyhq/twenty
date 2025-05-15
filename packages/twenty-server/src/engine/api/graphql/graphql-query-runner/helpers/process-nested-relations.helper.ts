import { Injectable } from '@nestjs/common';

import { FindOptionsRelations, ObjectLiteral } from 'typeorm';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { ProcessNestedRelationsV2Helper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations-v2.helper';
import { AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';

@Injectable()
export class ProcessNestedRelationsHelper {
  constructor(
    private readonly processNestedRelationsV2Helper: ProcessNestedRelationsV2Helper,
    private readonly processAggregateHelper: ProcessAggregateHelper,
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
    dataSource,
    shouldBypassPermissionChecks,
    roleId,
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
    dataSource: WorkspaceDataSource;
    shouldBypassPermissionChecks: boolean;
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
      dataSource,
      shouldBypassPermissionChecks,
      roleId,
    });
  }
}
