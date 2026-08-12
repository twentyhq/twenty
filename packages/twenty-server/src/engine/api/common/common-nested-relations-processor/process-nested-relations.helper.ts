import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { type FindOptionsRelations, type ObjectLiteral } from 'typeorm';

import { ProcessNestedRelationsOrmV2Helper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations-orm-v2.helper';
import { ProcessNestedRelationsV2Helper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations-v2.helper';
import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

@Injectable()
export class ProcessNestedRelationsHelper {
  constructor(
    private readonly processNestedRelationsV2Helper: ProcessNestedRelationsV2Helper,
    private readonly processNestedRelationsOrmV2Helper: ProcessNestedRelationsOrmV2Helper,
  ) {}

  public async processNestedRelations<T extends ObjectRecord = ObjectRecord>({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    parentObjectMetadataItem,
    parentObjectRecords,
    parentObjectRecordsAggregatedValues = {},
    relations,
    aggregate = {},
    limit,
    authContext,
    workspaceDataSource,
    rolePermissionConfig,
    selectedFields,
    isOrmV2ReadPathEnabled = false,
    useReplica = false,
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    parentObjectMetadataItem: FlatObjectMetadata;
    parentObjectRecords: T[];
    // oxlint-disable-next-line typescript/no-explicit-any
    parentObjectRecordsAggregatedValues?: Record<string, any>;
    relations: Record<string, FindOptionsRelations<ObjectLiteral>>;
    aggregate?: Record<string, AggregationField>;
    limit: number;
    authContext: WorkspaceAuthContext;
    workspaceDataSource: GlobalWorkspaceDataSource;
    rolePermissionConfig?: RolePermissionConfig;
    // oxlint-disable-next-line typescript/no-explicit-any
    selectedFields: Record<string, any>;
    isOrmV2ReadPathEnabled?: boolean;
    useReplica?: boolean;
  }): Promise<void> {
    if (isOrmV2ReadPathEnabled) {
      return this.processNestedRelationsOrmV2Helper.processNestedRelations({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        parentObjectMetadataItem,
        parentObjectRecords,
        parentObjectRecordsAggregatedValues,
        relations,
        aggregate,
        limit,
        authContext,
        useReplica,
        rolePermissionConfig,
        selectedFields,
      });
    }

    return this.processNestedRelationsV2Helper.processNestedRelations({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      parentObjectMetadataItem,
      parentObjectRecords,
      parentObjectRecordsAggregatedValues,
      relations,
      aggregate,
      limit,
      authContext,
      workspaceDataSource,
      rolePermissionConfig,
      selectedFields,
    });
  }
}
