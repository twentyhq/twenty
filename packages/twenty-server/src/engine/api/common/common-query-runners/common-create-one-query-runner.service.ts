import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { type ObjectRecord } from 'twenty-shared/types';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { CommonCreateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service';
import { computeMaxFieldCountPerRecord } from 'src/engine/api/common/common-query-runners/utils/compute-max-field-count-per-record.util';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
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
import { type CommonQueryResultProcessingArgs } from 'src/engine/api/common/types/common-query-result-processing-args.type';

@Injectable()
export class CommonCreateOneQueryRunnerService extends CommonBaseQueryRunnerService<
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
  ): Promise<ObjectRecord> {
    const result = await this.commonCreateManyQueryRunnerService.run(
      {
        ...args,
        data: [args.data],
      },
      queryRunnerContext,
    );

    return result[0];
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
      selectedFieldsResult,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      recordLimitPerOneToManyRelation: args.upsert ? QUERY_MAX_RECORDS : 0,
    });
  }
}
