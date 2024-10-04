import { Injectable } from '@nestjs/common';

import {
  Record as IRecord,
  Record,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { settings } from 'src/engine/constants/settings';
import { DUPLICATE_CRITERIA_COLLECTION } from 'src/engine/core-modules/duplicate/constants/duplicate-criteria.constants';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class DuplicateService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async findExistingRecords(
    recordIds: (string | number)[],
    objectMetadata: ObjectMetadataInterface,
    workspaceId: string,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const results = await this.workspaceDataSourceService.executeRawQuery(
      `
          SELECT 
             *
          FROM
              ${dataSourceSchema}."${computeObjectTargetTable(
                objectMetadata,
              )}" p
          WHERE
              p."id" IN (${recordIds
                .map((_, index) => `$${index + 1}`)
                .join(', ')})
          `,
      recordIds,
      workspaceId,
    );

    return results as IRecord[];
  }

  buildDuplicateConditionForGraphQL(
    objectMetadata: ObjectMetadataInterface,
    argsData?: Partial<Record>,
    filteringByExistingRecordId?: string,
  ) {
    if (!argsData) {
      return;
    }

    const criteriaCollection =
      this.getApplicableDuplicateCriteriaCollection(objectMetadata);

    const criteriaWithMatchingArgs = criteriaCollection.filter((criteria) =>
      criteria.columnNames.every((columnName) => {
        const value = argsData[columnName] as string | undefined;

        return (
          !!value && value.length >= settings.minLengthOfStringForDuplicateCheck
        );
      }),
    );

    const filterCriteria = criteriaWithMatchingArgs.map((criteria) =>
      Object.fromEntries(
        criteria.columnNames.map((columnName) => [
          columnName,
          { eq: argsData[columnName] },
        ]),
      ),
    );

    return {
      // when filtering by an existing record, we need to filter that explicit record out
      ...(filteringByExistingRecordId && {
        id: { neq: filteringByExistingRecordId },
      }),
      // keep condition as "or" to get results by more duplicate criteria
      or: filterCriteria,
    };
  }

  private getApplicableDuplicateCriteriaCollection(
    objectMetadataItem: ObjectMetadataInterface,
  ) {
    return DUPLICATE_CRITERIA_COLLECTION.filter(
      (duplicateCriteria) =>
        duplicateCriteria.objectName === objectMetadataItem.nameSingular,
    );
  }
}
