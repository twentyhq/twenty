import { BadRequestException, Injectable } from '@nestjs/common';

import { type Request } from 'express';
import isEmpty from 'lodash.isempty';
import { type ObjectRecord } from 'twenty-shared/types';
import { In } from 'typeorm';

import {
  type FormatResult,
  RestApiBaseHandler,
} from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { CommonFindDuplicatesQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-duplicates-query-runner.service';
import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';
import { buildDuplicateConditions } from 'src/engine/api/utils/build-duplicate-conditions.utils';

@Injectable()
export class RestApiFindDuplicatesHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonFindDuplicatesQueryRunnerService: CommonFindDuplicatesQueryRunnerService,
  ) {
    super();
  }

  async commonHandle(request: AuthenticatedRequest) {
    try {
      this.validate(request);

      const { data, ids, depth } = this.parseRequestArgs(request);

      const {
        authContext,
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      } = await this.buildCommonOptions(request);

      const selectedFields = await this.computeSelectedFields({
        depth,
        objectMetadataMapItem: objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
        authContext,
      });

      const duplicateConnections =
        await this.commonFindDuplicatesQueryRunnerService.execute(
          { data, ids, selectedFields },
          {
            authContext,
            objectMetadataMaps,
            objectMetadataItemWithFieldMaps,
          },
        );

      return this.formatRestResponse(
        duplicateConnections,
        objectMetadataItemWithFieldMaps.nameSingular,
      );
    } catch (error) {
      workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse(
    duplicateConnections: Array<{
      records: ObjectRecord[];
      totalCount: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    }>,
    objectNameSingular: string,
  ) {
    return {
      data: duplicateConnections.map((connection) => ({
        [`${objectNameSingular}Duplicates`]: connection.records,
        totalCount: connection.totalCount,
        pageInfo: {
          hasNextPage: connection.hasNextPage,
          hasPreviousPage: connection.hasPreviousPage,
          startCursor: connection.startCursor,
          endCursor: connection.endCursor,
        },
      })),
    };
  }

  private parseRequestArgs(request: AuthenticatedRequest) {
    return {
      data: request.body.data,
      ids: request.body.ids,
      depth: parseDepthRestRequest(request),
    };
  }

  async handle(request: AuthenticatedRequest) {
    this.validate(request);

    const {
      repository,
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
      restrictedFields,
    } = await this.getRepositoryAndMetadataOrFail(request);

    const existingRecordsQueryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldsMaps.nameSingular,
    );

    let objectRecords: Partial<ObjectRecord>[] = [];

    if (request.body.ids) {
      objectRecords = (await existingRecordsQueryBuilder
        .where({ id: In(request.body.ids) })
        .getMany()) as ObjectRecord[];
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
        restrictedFields,
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
