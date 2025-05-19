import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';
import isEmpty from 'lodash.isempty';
import { In } from 'typeorm';

import {
  FormatResult,
  RestApiBaseHandler,
} from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';
import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { buildDuplicateConditions } from 'src/engine/api/utils/build-duplicate-conditions.utils';

@Injectable()
export class RestApiFindDuplicatesHandler extends RestApiBaseHandler {
  async handle(request: Request) {
    this.validate(request);

    const { repository, objectMetadata, objectMetadataItemWithFieldsMaps } =
      await this.getRepositoryAndMetadataOrFail(request);

    const existingRecordsQueryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldsMaps.nameSingular,
    );

    let objectRecords: Partial<ObjectRecord>[] = [];

    if (request.body.ids) {
      const nonFormattedObjectRecords = (await existingRecordsQueryBuilder
        .where({ id: In(request.body.ids) })
        .getMany()) as ObjectRecord[];

      objectRecords = formatResult(
        nonFormattedObjectRecords,
        objectMetadataItemWithFieldsMaps,
        objectMetadata.objectMetadataMaps,
      );
    } else if (request.body.data && !isEmpty(request.body.data)) {
      objectRecords = request.body.data;
    }

    const duplicateConditions = objectRecords.map((record) =>
      buildDuplicateConditions(
        objectMetadataItemWithFieldsMaps,
        [record],
        record.id,
      ),
    );

    const result: { data: FormatResult[] } = {
      data: [],
    };

    for (const duplicateCondition of duplicateConditions) {
      const {
        records,
        isForwardPagination,
        hasMoreRecords,
        totalCount,
        startCursor,
        endCursor,
      } = await this.findRecords({
        request,
        repository,
        objectMetadata,
        objectMetadataItemWithFieldsMaps,
        extraFilters: duplicateCondition,
      });

      const paginatedResult = this.formatPaginatedDuplicatesResult({
        finalRecords: records,
        objectMetadataNameSingular:
          objectMetadata.objectMetadataMapItem.nameSingular,
        isForwardPagination,
        hasMoreRecords,
        totalCount,
        startCursor,
        endCursor,
      });

      result.data.push(paginatedResult);
    }

    return result;
  }

  private validate(request: Request) {
    const { data, ids } = request.body;

    if (!data && !ids) {
      throw new BadRequestException(
        'You have to provide either "data" or "ids" argument',
      );
    }

    if (data && ids) {
      throw new BadRequestException(
        'You cannot provide both "data" and "ids" arguments',
      );
    }

    if (!ids && isEmpty(data)) {
      throw new BadRequestException(
        'The "data" condition can not be empty when "ids" input not provided',
      );
    }
  }

  formatPaginatedDuplicatesResult({
    finalRecords,
    objectMetadataNameSingular,
    isForwardPagination,
    hasMoreRecords,
    totalCount,
    startCursor,
    endCursor,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    finalRecords: any[];
    objectMetadataNameSingular: string;
    isForwardPagination: boolean;
    hasMoreRecords: boolean;
    totalCount: number;
    startCursor: string | null;
    endCursor: string | null;
  }) {
    const hasPreviousPage = !isForwardPagination && hasMoreRecords;

    return this.formatResult({
      operation: 'findDuplicates',
      objectNameSingular: objectMetadataNameSingular,
      data: isForwardPagination ? finalRecords : finalRecords.reverse(),
      pageInfo: {
        hasNextPage: isForwardPagination && hasMoreRecords,
        ...(hasPreviousPage ? { hasPreviousPage } : {}),
        startCursor,
        endCursor,
      },
      totalCount,
    });
  }
}
