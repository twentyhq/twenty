import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { CommonCreateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service';
import { CreateOneQueryArgs } from 'src/engine/api/common/types/common-query-args.type';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class CommonCreateOneQueryRunnerService extends CommonBaseQueryRunnerService {
  constructor(
    private readonly commonCreateManyQueryRunnerService: CommonCreateManyQueryRunnerService,
  ) {
    super();
  }

  async run({
    args,
    authContext,
    objectMetadataMaps,
    objectMetadataItemWithFieldMaps,
  }: {
    args: CreateOneQueryArgs;
    authContext: AuthContext;
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  }): Promise<ObjectRecord> {
    const result = await this.commonCreateManyQueryRunnerService.run({
      args: {
        ...args,
        data: [args.data],
      },
      authContext,
      objectMetadataMaps,
      objectMetadataItemWithFieldMaps,
    });

    return result[0];
  }
}
