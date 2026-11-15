import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import { ObjectRecord } from 'twenty-shared/types';

import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  FindOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { type CommonQueryResultProcessingArgs } from 'src/engine/api/common/types/common-query-result-processing-args.type';

@Injectable()
export class CommonFindOneQueryRunnerService extends CommonBaseQueryRunnerService<
  FindOneQueryArgs,
  ObjectRecord
> {
  protected readonly operationName = CommonQueryNames.FIND_ONE;

  async run(
    args: CommonExtendedInput<FindOneQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord> {
    const {
      authContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
      commonQueryParser,
    } = queryRunnerContext;

    const readRepository = this.getReadRepository(queryRunnerContext);

    const queryBuilder = readRepository.createQueryBuilder(
      flatObjectMetadata.nameSingular,
    );

    commonQueryParser.applyFilterToBuilder(
      queryBuilder,
      flatObjectMetadata.nameSingular,
      args.filter ?? ({} as ObjectRecordFilter),
    );

    commonQueryParser.applyDeletedAtToBuilder(
      queryBuilder,
      args.filter ?? ({} as ObjectRecordFilter),
    );

    const columnsToSelect = buildColumnsToSelect({
      select: args.selectedFieldsResult.select,
      relationSelections: args.selectedFieldsResult.relationSelections,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
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
        {
          userFriendlyMessage: msg`This record does not exist or has been deleted.`,
        },
      );
    }

    const objectRecords = [objectRecord] as ObjectRecord[];

    await this.processNestedRelationsHelper.processNestedRelations({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      parentObjectMetadataItem: flatObjectMetadata,
      parentObjectRecords: objectRecords,
      relationSelections: args.selectedFieldsResult.relationSelections,
      limit: QUERY_MAX_RECORDS_FROM_RELATION,
      authContext,
      selectedFields: args.selectedFieldsResult.select,
      ...this.getNestedRelationsReadPathOptions(),
    });

    return objectRecords[0];
  }

  async computeArgs(
    args: CommonInput<FindOneQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<FindOneQueryArgs>> {
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = queryRunnerContext;

    return {
      ...args,
      filter: this.filterArgProcessor.process({
        filter: args.filter,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    };
  }

  async processQueryResult({
    queryResult,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    authContext,
    relationSelections,
  }: CommonQueryResultProcessingArgs<ObjectRecord>): Promise<ObjectRecord> {
    return this.commonResultGettersService.processRecord({
      record: queryResult,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      workspaceId: authContext.workspace.id,
      relationSelections,
    });
  }

  async validate(
    args: CommonInput<FindOneQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    if (!args.filter || Object.keys(args.filter).length === 0) {
      throw new CommonQueryRunnerException(
        'Missing filter argument',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }
}
