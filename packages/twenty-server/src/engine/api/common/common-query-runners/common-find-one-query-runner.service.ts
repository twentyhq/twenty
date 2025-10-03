import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { FindOptionsRelations, ObjectLiteral } from 'typeorm';

import { CommonQueryRunnerOptions } from 'src/engine/api/common/interfaces/common-query-runner-options.interface';
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
  RawSelectedFields,
} from 'src/engine/api/common/types/common-query-args.type';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';

@Injectable()
export class CommonFindOneQueryRunnerService extends CommonBaseQueryRunnerService<ObjectRecord> {
  async run(
    rawSelectedFields: RawSelectedFields,
    args: FindOneQueryArgs,
    options: CommonQueryRunnerOptions,
  ): Promise<ObjectRecord> {
    const {
      workspaceDataSource,
      repository,
      roleId,
      shouldBypassPermissionChecks,
      objectsPermissions,
    } = await this.prepareQueryRunnerContext(options);

    const selectedFieldsResult = await this.computeSelectedFields(
      rawSelectedFields,
      options,
      objectsPermissions,
    );

    const processedArgs = await this.processQueryArgs(options, args);

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
      options.objectMetadataItemWithFieldMaps.nameSingular,
    );

    //TODO : Refacto-common - QueryParser should be common branded service
    const commonQueryParser = new GraphqlQueryParser(
      options.objectMetadataItemWithFieldMaps,
      options.objectMetadataMaps,
    );

    commonQueryParser.applyFilterToBuilder(
      queryBuilder,
      options.objectMetadataItemWithFieldMaps.nameSingular,
      processedArgs.filter ?? ({} as ObjectRecordFilter),
    );

    commonQueryParser.applyDeletedAtToBuilder(
      queryBuilder,
      processedArgs.filter ?? ({} as ObjectRecordFilter),
    );

    const columnsToSelect = buildColumnsToSelect({
      select: selectedFieldsResult.select,
      relations: selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps: options.objectMetadataItemWithFieldMaps,
      objectMetadataMaps: options.objectMetadataMaps,
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

    if (selectedFieldsResult.relations) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps: options.objectMetadataMaps,
        parentObjectMetadataItem: options.objectMetadataItemWithFieldMaps,
        parentObjectRecords: objectRecords,
        //TODO : Refacto-common - To fix when switching processNestedRelationsHelper to Common
        relations: selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        limit: QUERY_MAX_RECORDS,
        authContext: options.authContext,
        workspaceDataSource,
        roleId,
        shouldBypassPermissionChecks,
        selectedFields: selectedFieldsResult.select,
      });
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(options.objectMetadataMaps);

    const records = typeORMObjectRecordsParser.processRecord({
      objectRecord: objectRecords[0],
      objectName: options.objectMetadataItemWithFieldMaps.nameSingular,
      take: 1,
      totalCount: 1,
    }) as ObjectRecord;

    return this.enrichResultsWithGettersAndHooks(
      records,
      options,
      CommonQueryNames.findOne,
    );
  }

  async processQueryArgs(
    options: CommonQueryRunnerOptions,
    args: FindOneQueryArgs,
  ): Promise<FindOneQueryArgs> {
    const hookedArgs =
      await this.workspaceQueryHookService.executePreQueryHooks(
        options.authContext,
        options.objectMetadataItemWithFieldMaps.nameSingular,
        CommonQueryNames.findOne,
        args,
      );

    return {
      filter: this.queryRunnerArgsFactory.overrideFilterByFieldMetadata(
        hookedArgs.filter,
        options.objectMetadataItemWithFieldMaps,
      ),
    };
  }
}
