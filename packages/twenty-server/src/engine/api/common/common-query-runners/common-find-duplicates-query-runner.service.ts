import { Injectable } from '@nestjs/common';

import isEmpty from 'lodash.isempty';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { ObjectRecord, OrderByDirection } from 'twenty-shared/types';
import { In } from 'typeorm';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import {
  CommonQueryNames,
  FindDuplicatesQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { getPageInfo } from 'src/engine/api/common/utils/get-page-info.util';
import { isWorkspaceAuthContext } from 'src/engine/api/common/utils/is-workspace-auth-context.util';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { buildDuplicateConditions } from 'src/engine/api/utils/build-duplicate-conditions.utils';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export interface PaginatedDuplicates {
  records: ObjectRecord[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

@Injectable()
export class CommonFindDuplicatesQueryRunnerService extends CommonBaseQueryRunnerService {
  async run({
    args,
    authContext,
    objectMetadataMaps,
    objectMetadataItemWithFieldMaps,
  }: {
    args: FindDuplicatesQueryArgs;
    authContext: AuthContext;
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  }): Promise<PaginatedDuplicates[]> {
    this.validate(args);

    if (!isWorkspaceAuthContext(authContext)) {
      throw new CommonQueryRunnerException(
        'Invalid auth context',
        CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT,
      );
    }

    const { repository } = await this.prepareQueryRunnerContext({
      authContext,
      objectMetadataItemWithFieldMaps,
    });

    const commonQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    const selectedFieldsResult = commonQueryParser.parseSelectedFields(
      objectMetadataItemWithFieldMaps,
      args.selectedFields,
      objectMetadataMaps,
    );

    const processedArgs = await this.processQueryArgs({
      authContext,
      objectMetadataItemWithFieldMaps,
      args,
    });

    const existingRecordsQueryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    let objectRecords: Partial<ObjectRecord>[] = [];

    const columnsToSelect = buildColumnsToSelect({
      select: selectedFieldsResult.select,
      relations: selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    if (processedArgs.ids) {
      objectRecords = (await existingRecordsQueryBuilder
        .where({ id: In(processedArgs.ids) })
        .setFindOptions({
          select: columnsToSelect,
        })
        .getMany()) as ObjectRecord[];
    } else if (processedArgs.data && !isEmpty(processedArgs.data)) {
      objectRecords = processedArgs.data;
    }

    const duplicateConnections: PaginatedDuplicates[] = await Promise.all(
      objectRecords.map(async (record) => {
        const duplicateConditions = buildDuplicateConditions(
          objectMetadataItemWithFieldMaps,
          [record],
          record.id,
        );

        if (isEmpty(duplicateConditions)) {
          return {
            records: [],
            totalCount: 0,
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          };
        }

        const duplicateRecordsQueryBuilder = repository.createQueryBuilder(
          objectMetadataItemWithFieldMaps.nameSingular,
        );

        commonQueryParser.applyFilterToBuilder(
          duplicateRecordsQueryBuilder,
          objectMetadataItemWithFieldMaps.nameSingular,
          duplicateConditions,
        );

        const duplicates = (await duplicateRecordsQueryBuilder
          .setFindOptions({
            select: columnsToSelect,
          })
          .take(QUERY_MAX_RECORDS)
          .getMany()) as ObjectRecord[];

        const enrichedDuplicates = await this.enrichResultsWithGettersAndHooks({
          results: duplicates,
          operationName: CommonQueryNames.findDuplicates,
          authContext,
          objectMetadataItemWithFieldMaps,
          objectMetadataMaps,
        });

        const { startCursor, endCursor } = getPageInfo(
          enrichedDuplicates,
          [{ id: OrderByDirection.AscNullsFirst }],
          QUERY_MAX_RECORDS,
          true,
        );

        return {
          records: enrichedDuplicates,
          totalCount: enrichedDuplicates.length,
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor,
          endCursor,
        };
      }),
    );

    return duplicateConnections;
  }

  async processQueryArgs({
    authContext,
    objectMetadataItemWithFieldMaps,
    args,
  }: {
    authContext: WorkspaceAuthContext;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    args: FindDuplicatesQueryArgs;
  }): Promise<FindDuplicatesQueryArgs> {
    const hookedArgs =
      (await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItemWithFieldMaps.nameSingular,
        CommonQueryNames.findDuplicates,
        args,
        //TODO : Refacto-common - To fix when updating workspaceQueryHookService, removing gql typing dependency
      )) as FindDuplicatesQueryArgs;

    return {
      ...hookedArgs,
      ids: await Promise.all(
        hookedArgs.ids?.map((id) =>
          this.queryRunnerArgsFactory.overrideValueByFieldMetadata(
            'id',
            id,
            objectMetadataItemWithFieldMaps.fieldsById,
            objectMetadataItemWithFieldMaps,
          ),
        ) ?? [],
      ),
      data: await this.queryRunnerArgsFactory.overrideDataByFieldMetadata({
        partialRecordInputs: hookedArgs.data,
        authContext,
        objectMetadataItemWithFieldMaps,
        shouldBackfillPositionIfUndefined: false,
      }),
    };
  }

  validate(args: FindDuplicatesQueryArgs) {
    if (!args.data && !args.ids) {
      throw new CommonQueryRunnerException(
        'You have to provide either "data" or "ids" argument',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    if (args.data && args.ids) {
      throw new CommonQueryRunnerException(
        'You cannot provide both "data" and "ids" arguments',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    if (!args.ids && isEmpty(args.data)) {
      throw new CommonQueryRunnerException(
        'The "data" condition can not be empty when "ids" input not provided',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
  }
}
