import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { CommonRestoreManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-restore-many-query-runner.service';
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
  RestoreOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class CommonRestoreOneQueryRunnerService extends CommonBaseQueryRunnerService<
  RestoreOneQueryArgs,
  ObjectRecord
> {
  constructor(
    private readonly commonRestoreManyQueryRunnerService: CommonRestoreManyQueryRunnerService,
  ) {
    super();
  }

  protected readonly operationName = CommonQueryNames.RESTORE_ONE;

  async run(
    args: CommonExtendedInput<RestoreOneQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord> {
    const result = await this.commonRestoreManyQueryRunnerService.run(
      {
        ...args,
        filter: { id: { eq: args.id } },
      },
      queryRunnerContext,
    );

    if (!isDefined(result) || result.length === 0) {
      throw new CommonQueryRunnerException(
        'Record not found',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    return result[0];
  }

  async computeArgs(
    args: CommonInput<RestoreOneQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<RestoreOneQueryArgs>> {
    return args;
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
    args: CommonInput<RestoreOneQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    const { objectMetadataItemWithFieldMaps } = queryRunnerContext;

    assertMutationNotOnRemoteObject(objectMetadataItemWithFieldMaps);
    assertIsValidUuid(args.id);
  }
}
