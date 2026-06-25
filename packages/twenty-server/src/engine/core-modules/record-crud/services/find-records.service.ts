import { Injectable, Logger } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { OrderByDirection, type ObjectRecord } from 'twenty-shared/types';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { isNonEmptyArray } from '@sniptt/guards';
import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type FindRecordsParams } from 'src/engine/core-modules/record-crud/types/find-records-params.type';
import { type FindRecordsResult } from 'src/engine/core-modules/record-crud/types/find-records-result.type';
import { buildEffectiveSelectedFields } from 'src/engine/core-modules/record-crud/utils/build-effective-selected-fields.util';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class FindRecordsService {
  private readonly logger = new Logger(FindRecordsService.name);

  constructor(
    private readonly commonFindManyRunner: CommonFindManyQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilderService,
  ) {}

  async execute(
    params: FindRecordsParams,
  ): Promise<ToolOutput<FindRecordsResult>> {
    const {
      objectName,
      filter,
      orderBy,
      limit,
      offset = 0,
      authContext,
      select,
      shouldBuildEffectiveSelectFields,
    } = params;

    if (shouldBuildEffectiveSelectFields && !isNonEmptyArray(select)) {
      return {
        success: false,
        message: 'Select at least one field in select parameter',
        error: 'Select is required',
      };
    }

    try {
      const {
        queryRunnerContext,
        selectedFields: allSelectableFields,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      } = await this.commonApiContextBuilder.build({
        authContext,
        objectName,
      });

      const { effectiveSelectedFields, warnings } =
        shouldBuildEffectiveSelectFields && isDefined(select)
          ? buildEffectiveSelectedFields({
              select,
              filter,
              orderBy,
              objectName,
              flatObjectMetadata,
              flatFieldMetadataMaps,
              selectedFields: allSelectableFields,
            })
          : { effectiveSelectedFields: allSelectableFields, warnings: [] };

      // Add id to orderBy for consistent pagination
      const orderByWithIdCondition: ObjectRecordOrderBy = [
        ...(orderBy ?? []).filter((item) => item !== undefined),
        { id: OrderByDirection.AscNullsFirst },
      ];

      const {
        results: { records, totalCount },
      } = await this.commonFindManyRunner.execute(
        {
          filter,
          orderBy: orderByWithIdCondition,
          first: limit ? Math.min(limit, QUERY_MAX_RECORDS) : QUERY_MAX_RECORDS,
          offset,
          selectedFields: { ...effectiveSelectedFields, totalCount: true },
        },
        queryRunnerContext,
      );

      this.logger.log(`Found ${records.length} records in ${objectName}`);

      const recordReferences = records.map((record: ObjectRecord) => ({
        objectNameSingular: objectName,
        recordId: record.id as string,
        displayName: getRecordDisplayName(
          record,
          flatObjectMetadata,
          flatFieldMetadataMaps,
        ),
      }));

      return {
        success: true,
        message: `Found ${records.length} ${objectName} records`,
        result: {
          records,
          count: totalCount,
        },
        ...(isNonEmptyArray(warnings) ? { warnings: warnings } : {}),
        recordReferences,
      };
    } catch (error) {
      this.logger.error(`Failed to find records: ${error}`);

      return {
        success: false,
        message: `Failed to find ${objectName} records`,
        error:
          error instanceof Error ? error.message : 'Failed to find records',
      };
    }
  }
}
