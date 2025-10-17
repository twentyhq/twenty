import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { ObjectRecord } from 'twenty-shared/types';
import { FindOptionsRelations, ObjectLiteral } from 'typeorm';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import {
  CommonQueryNames,
  DeleteManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { isWorkspaceAuthContext } from 'src/engine/api/common/utils/is-workspace-auth-context.util';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

@Injectable()
export class CommonDeleteManyQueryRunnerService extends CommonBaseQueryRunnerService {
  async run({
    args,
    authContext: toValidateAuthContext,
    objectMetadataMaps,
    objectMetadataItemWithFieldMaps,
  }: {
    args: DeleteManyQueryArgs;
    authContext: AuthContext;
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  }): Promise<ObjectRecord[]> {
    this.validate(args, objectMetadataItemWithFieldMaps);
    const authContext = toValidateAuthContext;

    if (!isWorkspaceAuthContext(authContext)) {
      throw new CommonQueryRunnerException(
        'Invalid auth context',
        CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT,
      );
    }

    const {
      workspaceDataSource,
      repository,
      roleId,
      shouldBypassPermissionChecks,
    } = await this.prepareQueryRunnerContext({
      authContext,
      objectMetadataItemWithFieldMaps,
    });

    const processedArgs = await this.processQueryArgs({
      authContext,
      objectMetadataItemWithFieldMaps,
      args,
    });

    const queryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const tableName = computeTableName(
      objectMetadataItemWithFieldMaps.nameSingular,
      objectMetadataItemWithFieldMaps.isCustom,
    );

    const commonQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    commonQueryParser.applyFilterToBuilder(
      queryBuilder,
      tableName,
      processedArgs.filter,
    );

    const columnsToReturn = buildColumnsToReturn({
      select: processedArgs.selectedFieldsResult.select,
      relations: processedArgs.selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    const deletedObjectRecords = await queryBuilder
      .softDelete()
      .returning(columnsToReturn)
      .execute();

    const deletedRecords = deletedObjectRecords.generatedMaps as ObjectRecord[];

    await this.processNestedRelationsIfNeeded({
      args: processedArgs,
      records: deletedRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      roleId,
      authContext,
      workspaceDataSource,
      shouldBypassPermissionChecks,
    });

    const enrichedRecords = await this.enrichResultsWithGettersAndHooks({
      results: deletedRecords,
      operationName: CommonQueryNames.deleteMany,
      authContext,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    return enrichedRecords;
  }

  private async processNestedRelationsIfNeeded({
    args,
    records,
    objectMetadataItemWithFieldMaps,
    objectMetadataMaps,
    roleId,
    authContext,
    workspaceDataSource,
    shouldBypassPermissionChecks,
  }: {
    args: DeleteManyQueryArgs;
    records: ObjectRecord[];
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    objectMetadataMaps: ObjectMetadataMaps;
    roleId?: string;
    authContext: AuthContext;
    workspaceDataSource: WorkspaceDataSource;
    shouldBypassPermissionChecks: boolean;
  }): Promise<void> {
    if (!args.selectedFieldsResult.relations) {
      return;
    }

    await this.processNestedRelationsHelper.processNestedRelations({
      objectMetadataMaps,
      parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
      parentObjectRecords: records,
      //TODO : Refacto-common - Typing to fix when switching processNestedRelationsHelper to Common
      relations: args.selectedFieldsResult.relations as Record<
        string,
        FindOptionsRelations<ObjectLiteral>
      >,
      limit: QUERY_MAX_RECORDS,
      authContext,
      workspaceDataSource,
      roleId,
      shouldBypassPermissionChecks,
      selectedFields: args.selectedFieldsResult.select,
    });
  }

  private validate(
    args: DeleteManyQueryArgs,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ) {
    assertMutationNotOnRemoteObject(objectMetadataItemWithFieldMaps);

    if (!args.filter) {
      throw new CommonQueryRunnerException(
        'Filter is required',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    // TODO : Refacto-common - Remove this validation once https://github.com/twentyhq/core-team-issues/issues/1627 done
    args.filter.id?.in?.forEach((id: string) => assertIsValidUuid(id));
  }

  async processQueryArgs({
    authContext,
    objectMetadataItemWithFieldMaps,
    args,
  }: {
    authContext: WorkspaceAuthContext;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    args: DeleteManyQueryArgs;
  }): Promise<DeleteManyQueryArgs> {
    return (await this.workspaceQueryHookService.executePreQueryHooks(
      authContext,
      objectMetadataItemWithFieldMaps.nameSingular,
      CommonQueryNames.deleteMany,
      args,
      //TODO : Refacto-common - To fix when updating workspaceQueryHookService, removing gql typing dependency
    )) as DeleteManyQueryArgs;
  }
}
