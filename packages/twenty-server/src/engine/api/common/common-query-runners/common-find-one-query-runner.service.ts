import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { FindOptionsRelations, ObjectLiteral } from 'typeorm';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import {
  ObjectRecord,
  ObjectRecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import {
  CommonQueryNames,
  FindOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { isWorkspaceAuthContext } from 'src/engine/api/common/utils/is-workspace-auth-context.util';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class CommonFindOneQueryRunnerService extends CommonBaseQueryRunnerService<ObjectRecord> {
  async run({
    args,
    authContext: toValidateAuthContext,
    objectMetadataMaps,
    objectMetadataItemWithFieldMaps,
  }: {
    args: FindOneQueryArgs;
    authContext: AuthContext;
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  }): Promise<ObjectRecord> {
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

    if (
      !processedArgs.filter ||
      Object.keys(processedArgs.filter).length === 0
    ) {
      throw new CommonQueryRunnerException(
        'Missing filter argument',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    const queryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    //TODO : Refacto-common - QueryParser should be common branded service
    const commonQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    commonQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataItemWithFieldMaps.nameSingular,
      processedArgs.filter ?? ({} as ObjectRecordFilter),
    );

    commonQueryParser.applyDeletedAtToBuilder(
      queryBuilder,
      processedArgs.filter ?? ({} as ObjectRecordFilter),
    );

    const columnsToSelect = buildColumnsToSelect({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    const objectRecord = await queryBuilder
      .setFindOptions({
        select: columnsToSelect,
      })
      .getOne();

    if (!objectRecord) {
      throw new CommonQueryRunnerException(
        'Record not found',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const objectRecords = [objectRecord] as ObjectRecord[];

    if (isDefined(args.selectedFieldsResult.relations)) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: objectRecords,
        //TODO : Refacto-common - To fix when switching processNestedRelationsHelper to Common
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

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    const results = typeORMObjectRecordsParser.processRecord({
      objectRecord: objectRecords[0],
      objectName: objectMetadataItemWithFieldMaps.nameSingular,
      take: 1,
      totalCount: 1,
    }) as ObjectRecord;

    return this.enrichResultsWithGettersAndHooks({
      results,
      authContext,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      operationName: CommonQueryNames.findOne,
    });
  }

  async processQueryArgs({
    authContext,
    objectMetadataItemWithFieldMaps,
    args,
  }: {
    authContext: WorkspaceAuthContext;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    args: FindOneQueryArgs;
  }): Promise<FindOneQueryArgs> {
    const hookedArgs =
      (await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItemWithFieldMaps.nameSingular,
        CommonQueryNames.findOne,
        args,
        //TODO : Refacto-common - To fix when updating workspaceQueryHookService, removing gql typing dependency
      )) as FindOneQueryArgs;

    return {
      ...hookedArgs,
      filter: this.queryRunnerArgsFactory.overrideFilterByFieldMetadata(
        hookedArgs.filter,
        objectMetadataItemWithFieldMaps,
      ),
    };
  }
}
