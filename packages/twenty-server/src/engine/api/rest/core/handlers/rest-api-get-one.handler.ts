import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';

@Injectable()
export class RestApiGetOneHandler extends RestApiBaseHandler {
  async handle(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (!isDefined(recordId)) {
      throw new BadRequestException(
        'No recordId provided in rest api get one query',
      );
    }

    const {
      objectMetadataNameSingular,
      repository,
      dataSource,
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
    } = await this.getRepositoryAndMetadataOrFail(request);

    const { records } = await this.findRecords({
      request,
      recordId,
      repository,
      dataSource,
      objectMetadata,
      objectMetadataNameSingular,
      objectMetadataItemWithFieldsMaps,
    });

    const record = records?.[0];

    if (!isDefined(record)) {
      throw new BadRequestException('Record not found');
    }

    return this.formatResult({
      operation: 'findOne',
      objectNameSingular: objectMetadataNameSingular,
      data: record,
    });
  }
}
