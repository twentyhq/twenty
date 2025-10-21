import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { CommonUpdateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-many-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { UpdateOneQueryArgs } from 'src/engine/api/common/types/common-query-args.type';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class CommonUpdateOneQueryRunnerService extends CommonBaseQueryRunnerService {
  constructor(
    private readonly commonUpdateManyQueryRunnerService: CommonUpdateManyQueryRunnerService,
  ) {
    super();
  }

  async run({
    args,
    authContext,
    objectMetadataMaps,
    objectMetadataItemWithFieldMaps,
  }: {
    args: UpdateOneQueryArgs;
    authContext: AuthContext;
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  }): Promise<ObjectRecord> {
    this.validate(args, objectMetadataItemWithFieldMaps);

    const result = await this.commonUpdateManyQueryRunnerService.run({
      args: {
        ...args,
        filter: { id: { eq: args.id } },
      },
      authContext,
      objectMetadataMaps,
      objectMetadataItemWithFieldMaps,
    });

    if (!result || result.length === 0) {
      throw new CommonQueryRunnerException(
        'Record not found',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    return result[0];
  }

  validate(
    args: UpdateOneQueryArgs,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ) {
    assertMutationNotOnRemoteObject(objectMetadataItemWithFieldMaps);
    assertIsValidUuid(args.id);
  }
}
