import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { CommonDeleteManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-many-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { DeleteOneQueryArgs } from 'src/engine/api/common/types/common-query-args.type';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class CommonDeleteOneQueryRunnerService extends CommonBaseQueryRunnerService {
  constructor(
    private readonly commonDeleteManyQueryRunnerService: CommonDeleteManyQueryRunnerService,
  ) {
    super();
  }

  async run({
    args,
    authContext,
    objectMetadataMaps,
    objectMetadataItemWithFieldMaps,
  }: {
    args: DeleteOneQueryArgs;
    authContext: AuthContext;
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  }): Promise<ObjectRecord> {
    this.validate(args, objectMetadataItemWithFieldMaps);

    const result = await this.commonDeleteManyQueryRunnerService.run({
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

  validate(
    args: DeleteOneQueryArgs,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ) {
    assertMutationNotOnRemoteObject(objectMetadataItemWithFieldMaps);
    // TODO : Refacto-common - Remove this validation once https://github.com/twentyhq/core-team-issues/issues/1627 done
    assertIsValidUuid(args.id);
  }
}
