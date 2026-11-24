import { ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommonRecordQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-record-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import { type CommonQueryRunResult } from 'src/engine/api/common/types/common-query-result.type';
import {
  CommonExtendedInput,
  CommonInput,
  DeleteManyQueryArgs,
  DeleteOneQueryArgs,
  DestroyManyQueryArgs,
  DestroyOneQueryArgs,
  RestoreManyQueryArgs,
  RestoreOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { type MutationKind } from 'src/engine/twenty-orm/sql/utils/build-mutation-statement.util';

type FilteredMutationManyQueryArgs =
  | DeleteManyQueryArgs
  | DestroyManyQueryArgs
  | RestoreManyQueryArgs;

export abstract class CommonFilteredMutationManyQueryRunnerService extends CommonRecordQueryRunnerService<
  FilteredMutationManyQueryArgs,
  ObjectRecord[]
> {
  protected abstract readonly mutationKind: Exclude<MutationKind, 'update'>;

  async run(
    args: CommonExtendedInput<FilteredMutationManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<CommonQueryRunResult<ObjectRecord[]>> {
    return this.runFilteredMutation({
      queryRunnerContext,
      filter: args.filter,
      selection: args.selectedFieldsResult,
      kind: this.mutationKind,
    });
  }

  async runOnOneRecord(
    args: Pick<
      CommonExtendedInput<
        DeleteOneQueryArgs | DestroyOneQueryArgs | RestoreOneQueryArgs
      >,
      'id' | 'selectedFieldsResult'
    >,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<CommonQueryRunResult<ObjectRecord[]>> {
    return this.runFilteredMutation({
      queryRunnerContext,
      filter: { id: { eq: args.id } },
      selection: args.selectedFieldsResult,
      kind: this.mutationKind,
      shouldWriteAtLeastOneRecord: true,
    });
  }

  async computeArgs(
    args: CommonInput<FilteredMutationManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<FilteredMutationManyQueryArgs>> {
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
    args: CommonInput<FilteredMutationManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    const { flatObjectMetadata } = queryRunnerContext;

    assertMutationNotOnRemoteObject(flatObjectMetadata);

    if (!isDefined(args.filter)) {
      throw new CommonQueryRunnerException(
        'Filter is required',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    args.filter.id?.in?.forEach((id: string) => assertIsValidUuid(id));
  }
}
