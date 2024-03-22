import { Injectable, Logger } from '@nestjs/common';

import isEmpty from 'lodash.isempty';

import { WorkspaceQueryBuilderOptions } from 'src/engine/api/graphql/workspace-query-builder/interfaces/workspace-query-builder-options.interface';
import { RecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { FindDuplicatesResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { stringifyWithoutKeyQuote } from 'src/engine/api/graphql/workspace-query-builder/utils/stringify-without-key-quote.util';
import { ArgsAliasFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/args-alias.factory';
import { duplicateCriteriaCollection } from 'src/engine/api/graphql/workspace-resolver-builder/constants/duplicate-criteria.constants';
import { settings } from 'src/engine/constants/settings';

import { FieldsStringFactory } from './fields-string.factory';

@Injectable()
export class FindDuplicatesQueryFactory {
  private readonly logger = new Logger(FindDuplicatesQueryFactory.name);

  constructor(
    private readonly fieldsStringFactory: FieldsStringFactory,
    private readonly argsAliasFactory: ArgsAliasFactory,
  ) {}

  async create<Filter extends RecordFilter = RecordFilter>(
    args: FindDuplicatesResolverArgs<Filter>,
    options: WorkspaceQueryBuilderOptions,
    currentRecord?: Record<string, unknown>,
  ) {
    const fieldsString = await this.fieldsStringFactory.create(
      options.info,
      options.fieldMetadataCollection,
      options.objectMetadataCollection,
    );

    const argsData = this.getFindDuplicateBy<Filter>(
      args,
      options,
      currentRecord,
    );

    const duplicateCondition = this.buildDuplicateCondition(
      options.objectMetadataItem,
      argsData,
      args.id,
    );

    const filters = stringifyWithoutKeyQuote(duplicateCondition);

    return `
      query {
        ${computeObjectTargetTable(options.objectMetadataItem)}Collection${
          isEmpty(duplicateCondition?.or)
            ? '(first: 0)'
            : `(filter: ${filters})`
        } {
          ${fieldsString}
        }
      }
    `;
  }

  getFindDuplicateBy<Filter extends RecordFilter = RecordFilter>(
    args: FindDuplicatesResolverArgs<Filter>,
    options: WorkspaceQueryBuilderOptions,
    currentRecord?: Record<string, unknown>,
  ) {
    if (currentRecord) {
      return currentRecord;
    }

    return this.argsAliasFactory.create(
      args.data ?? {},
      options.fieldMetadataCollection,
    );
  }

  buildQueryForExistingRecord(
    id: string,
    options: WorkspaceQueryBuilderOptions,
  ) {
    return `
      query {
        ${computeObjectTargetTable(
          options.objectMetadataItem,
        )}Collection(filter: { id: { eq: "${id}" }}){
          edges {
            node {
              __typename
              ${this.getApplicableDuplicateCriteriaCollection(
                options.objectMetadataItem,
              )
                .flatMap((dc) => dc.columnNames)
                .join('\n')}
            }
          }
        }
      }
    `;
  }

  private buildDuplicateCondition(
    objectMetadataItem: ObjectMetadataInterface,
    argsData?: Record<string, unknown>,
    filteringByExistingRecordId?: string,
  ) {
    if (!argsData) {
      return;
    }

    const criteriaCollection =
      this.getApplicableDuplicateCriteriaCollection(objectMetadataItem);

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
    return duplicateCriteriaCollection.filter(
      (duplicateCriteria) =>
        duplicateCriteria.objectName === objectMetadataItem.nameSingular,
    );
  }
}
