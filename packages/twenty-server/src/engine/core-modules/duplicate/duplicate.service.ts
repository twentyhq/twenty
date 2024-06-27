import { Injectable } from '@nestjs/common';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';
import {
  Record as IRecord,
  Record,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

import { settings } from 'src/engine/constants/settings';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { DUPLICATE_CRITERIA_COLLECTION } from 'src/engine/core-modules/duplicate/constants/duplicate-criteria.constants';

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

  /**
   * TODO: Remove this code by September 1st, 2024 if it isn't used
   * It was build to be used by the upsertMany function, but it was not used.
   * It's a re-implementation of the methods to findDuplicates, but done
   * at the SQL layer instead of doing it at the GraphQL layer
   * 
  async findDuplicate(
    data: Partial<Record>,
    objectMetadata: ObjectMetadataInterface,
    workspaceId: string,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const { duplicateWhereClause, duplicateWhereParameters } =
      this.buildDuplicateConditionForUpsert(objectMetadata, data);

    const results = await this.workspaceDataSourceService.executeRawQuery(
      `
          SELECT 
             *
          FROM
              ${dataSourceSchema}."${computeObjectTargetTable(
                objectMetadata,
              )}" p
          WHERE
              ${duplicateWhereClause}
          `,
      duplicateWhereParameters,
      workspaceId,
    );

    return results.length > 0 ? results[0] : null;
  }

  private buildDuplicateConditionForUpsert(
    objectMetadata: ObjectMetadataInterface,
    data: Partial<Record>,
  ) {
    const criteriaCollection = this.getApplicableDuplicateCriteriaCollection(
      objectMetadata,
    ).filter(
      (duplicateCriteria) => duplicateCriteria.useAsUniqueKeyForUpsert === true,
    );

    const whereClauses: string[] = [];
    const whereParameters: any[] = [];
    let parameterIndex = 1;

    criteriaCollection.forEach((c) => {
      const clauseParts: string[] = [];

      c.columnNames.forEach((column) => {
        const dataKey = Object.keys(data).find(
          (key) => key.toLowerCase() === column.toLowerCase(),
        );

        if (dataKey) {
          clauseParts.push(`p."${column}" = $${parameterIndex}`);
          whereParameters.push(data[dataKey]);
          parameterIndex++;
        }
      });
      if (clauseParts.length > 0) {
        whereClauses.push(`(${clauseParts.join(' AND ')})`);
      }
    });

    const duplicateWhereClause = whereClauses.join(' OR ');
    const duplicateWhereParameters = whereParameters;

    return { duplicateWhereClause, duplicateWhereParameters };
  }
  *
  */
}
