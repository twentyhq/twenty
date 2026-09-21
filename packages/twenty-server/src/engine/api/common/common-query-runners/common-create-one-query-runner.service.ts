import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { CommonCreateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service';
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
  CreateManyQueryArgs,
  CreateOneQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';

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

    // The row is inserted, then read back through the normal permission
    // filters. If those hide it (app-scope, RLS, visibility policy), the
    // result is empty — surface that as a real error instead of handing
    // `undefined` down to processQueryResult, which reads its keys and dies
    // with an unrelated TypeError.
    if (!isDefined(result[0])) {
      throw new CommonQueryRunnerException(
        `Record was created but is not readable with your current permissions`,
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
        {
          userFriendlyMessage: msg`The record was created but you do not have permission to read it back. Check your access to the record's App.`,
        },
      );
    }

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

  async processQueryResult(
    queryResult: ObjectRecord,
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
    authContext: WorkspaceAuthContext,
  ): Promise<ObjectRecord> {
    return this.commonResultGettersService.processRecord(
      queryResult,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      authContext.workspace.id,
    );
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
}
