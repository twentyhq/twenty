import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { CommonDestroyManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-many-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { DestroyOneQueryArgs } from 'src/engine/api/common/types/common-query-args.type';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class CommonDestroyOneQueryRunnerService extends CommonBaseQueryRunnerService {
  constructor(
    private readonly commonDestroyManyQueryRunnerService: CommonDestroyManyQueryRunnerService,
  ) {
    super();
  }

  async run({
    args,
    authContext,
    objectMetadataMaps,
    objectMetadataItemWithFieldMaps,
  }: {
    args: DestroyOneQueryArgs;
    authContext: AuthContext;
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  }): Promise<ObjectRecord> {
    this.validate(args);

    const result = await this.commonDestroyManyQueryRunnerService.run({
      args: {
        ...args,
        filter: { id: { eq: args.id } },
      },
      authContext,
      objectMetadataMaps,
      objectMetadataItemWithFieldMaps,
    });

    if (!isDefined(result) || result.length === 0) {
      throw new CommonQueryRunnerException(
        'Record not found',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    return result[0];
  }

  validate(args: DestroyOneQueryArgs) {
    if (!isDefined(args.id)) {
      throw new CommonQueryRunnerException(
        'Missing id',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
  }
}
