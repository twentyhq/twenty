import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { ObjectRecord } from 'twenty-shared/types';

import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CommonRecordQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-record-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonQueryRunResult } from 'src/engine/api/common/types/common-query-result.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  FindOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { buildColumnsToSelect } from 'src/engine/api/common/utils/build-columns-to-select';

@Injectable()
export class CommonFindOneQueryRunnerService extends CommonRecordQueryRunnerService<
  FindOneQueryArgs,
  ObjectRecord
> {
  protected readonly operationName = CommonQueryNames.FIND_ONE;

  async run(
    args: CommonExtendedInput<FindOneQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<CommonQueryRunResult<ObjectRecord>> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
      commonQueryParser,
    } = queryRunnerContext;

    const readRepository = this.getReadRepository(queryRunnerContext);

    const queryBuilder = readRepository.createQueryBuilder(
      flatObjectMetadata.nameSingular,
    );

    commonQueryParser.applyFilterToBuilder({
      queryBuilder,
      objectNameSingular: flatObjectMetadata.nameSingular,
      recordFilter: args.filter ?? {},
    });

    commonQueryParser.applyDeletedAtToBuilder({
      queryBuilder,
      recordFilter: args.filter ?? {},
    });

    const columnsToSelect = buildColumnsToSelect({
      selection: args.selectedFieldsResult,
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

    const relationAggregatedValues = await this.processNestedRelations({
      records: objectRecords,
      selection: args.selectedFieldsResult,
      queryRunnerContext,
    });

    return { result: objectRecords[0], relationAggregatedValues };
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
