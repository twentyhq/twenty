import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { type ObjectRecord } from 'twenty-shared/types';

import { CommonRecordQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-record-query-runner.service';
import { CommonCreateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service';
import { computeMaxFieldCountPerRecord } from 'src/engine/api/common/common-query-runners/utils/compute-max-field-count-per-record.util';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonQueryRunResult } from 'src/engine/api/common/types/common-query-result.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  CreateManyQueryArgs,
  CreateOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';

@Injectable()
export class CommonCreateOneQueryRunnerService extends CommonRecordQueryRunnerService<
  CreateOneQueryArgs,
  ObjectRecord
> {
  constructor(
    private readonly commonCreateManyQueryRunnerService: CommonCreateManyQueryRunnerService,
  ) {
    super();
  }

  protected readonly operationName = CommonQueryNames.CREATE_ONE;

  async run(
    args: CommonExtendedInput<CreateManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<CommonQueryRunResult<ObjectRecord>> {
    const { result, relationAggregatedValues } =
      await this.commonCreateManyQueryRunnerService.run(
        {
          ...args,
          data: [args.data],
        },
        queryRunnerContext,
      );

    return { result: result[0], relationAggregatedValues };
  }

  async computeArgs(
    args: CommonInput<CreateOneQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<CreateOneQueryArgs>> {
    const {
      authContext,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    } = queryRunnerContext;

    const coercedData = await this.dataArgProcessor.process({
      partialRecordInputs: [args.data],
      authContext,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      shouldBackfillPositionIfUndefined: !args.upsert,
    });

    return {
      ...args,
      data: coercedData[0],
    };
  }

  async validate(
    args: CommonInput<CreateOneQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    const { flatObjectMetadata } = queryRunnerContext;

    assertMutationNotOnRemoteObject(flatObjectMetadata);

    if (args.data?.id) {
      assertIsValidUuid(args.data.id);
    }
  }

  protected override computeQueryComplexityV2(
    selectedFieldsResult: CommonSelectedFieldsResult,
    args: CommonExtendedInput<CreateOneQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): number {
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = queryRunnerContext;

    return computeMaxFieldCountPerRecord({
      selection: selectedFieldsResult,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      recordLimitPerOneToManyRelation: args.upsert ? QUERY_MAX_RECORDS : 0,
    });
  }
}
