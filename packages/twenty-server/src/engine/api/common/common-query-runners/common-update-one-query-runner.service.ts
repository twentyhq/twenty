import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { CommonUpdateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-many-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  UpdateOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class CommonUpdateOneQueryRunnerService extends CommonBaseQueryRunnerService<
  UpdateOneQueryArgs,
  ObjectRecord
> {
  constructor(
    private readonly commonUpdateManyQueryRunnerService: CommonUpdateManyQueryRunnerService,
  ) {
    super();
  }
  protected readonly operationName = CommonQueryNames.UPDATE_ONE;

  async run(
    args: CommonExtendedInput<UpdateOneQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord> {
    const result = await this.commonUpdateManyQueryRunnerService.run(
      {
        ...args,
        filter: { id: { eq: args.id } },
      },
      queryRunnerContext,
    );

    if (!result || result.length === 0) {
      throw new CommonQueryRunnerException(
        'Record not found',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    return result[0];
  }

  async computeArgs(
    args: CommonInput<UpdateOneQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<UpdateOneQueryArgs>> {
    const { authContext, objectMetadataItemWithFieldMaps } = queryRunnerContext;

    return {
      ...args,
      data: (
        await this.queryRunnerArgsFactory.overrideDataByFieldMetadata({
          partialRecordInputs: [args.data],
          authContext,
          objectMetadataItemWithFieldMaps,
          shouldBackfillPositionIfUndefined: false,
        })
      )[0],
    };
  }

  async processQueryResult(
    queryResult: ObjectRecord,
    _objectMetadataItemId: string,
    _objectMetadataMaps: ObjectMetadataMaps,
    _authContext: WorkspaceAuthContext,
  ): Promise<ObjectRecord> {
    return queryResult;
  }

  async validate(
    args: CommonInput<UpdateOneQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    const { objectMetadataItemWithFieldMaps } = queryRunnerContext;

    assertMutationNotOnRemoteObject(objectMetadataItemWithFieldMaps);
    assertIsValidUuid(args.id);
  }
}
