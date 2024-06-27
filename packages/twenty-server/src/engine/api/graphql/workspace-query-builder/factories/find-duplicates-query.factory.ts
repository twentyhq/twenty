import { Injectable, Logger } from '@nestjs/common';

import isEmpty from 'lodash.isempty';

import { WorkspaceQueryBuilderOptions } from 'src/engine/api/graphql/workspace-query-builder/interfaces/workspace-query-builder-options.interface';
import { Record } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { FindDuplicatesResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { stringifyWithoutKeyQuote } from 'src/engine/api/graphql/workspace-query-builder/utils/stringify-without-key-quote.util';
import { ArgsAliasFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/args-alias.factory';
import { DuplicateService } from 'src/engine/core-modules/duplicate/duplicate.service';

import { FieldsStringFactory } from './fields-string.factory';

@Injectable()
export class FindDuplicatesQueryFactory {
  private readonly logger = new Logger(FindDuplicatesQueryFactory.name);

  constructor(
    private readonly fieldsStringFactory: FieldsStringFactory,
    private readonly argsAliasFactory: ArgsAliasFactory,
    private readonly duplicateService: DuplicateService,
  ) {}

  async create(
    args: FindDuplicatesResolverArgs,
    options: WorkspaceQueryBuilderOptions,
    existingRecords?: Record[],
  ) {
    const fieldsString = await this.fieldsStringFactory.create(
      options.info,
      options.fieldMetadataCollection,
      options.objectMetadataCollection,
    );

    if (existingRecords) {
      const query = existingRecords.reduce((acc, record, index) => {
        return (
          acc + this.buildQuery(fieldsString, options, undefined, record, index)
        );
      }, '');

      return `query {
        ${query}
      }`;
    }

    const query = args.data?.reduce((acc, dataItem, index) => {
      const argsData = this.argsAliasFactory.create(
        dataItem ?? {},
        options.fieldMetadataCollection,
      );

      return (
        acc +
        this.buildQuery(
          fieldsString,
          options,
          argsData as Record,
          undefined,
          index,
        )
      );
    }, '');

    return `query {
      ${query}
    }`;
  }

  buildQuery(
    fieldsString: string,
    options: WorkspaceQueryBuilderOptions,
    data?: Record,
    existingRecord?: Record,
    index?: number,
  ) {
    const duplicateCondition =
      this.duplicateService.buildDuplicateConditionForGraphQL(
        options.objectMetadataItem,
        data ?? existingRecord,
        existingRecord?.id,
      );

    const filters = stringifyWithoutKeyQuote(duplicateCondition);

    return `${computeObjectTargetTable(
      options.objectMetadataItem,
    )}Collection${index}: ${computeObjectTargetTable(
      options.objectMetadataItem,
    )}Collection${
      isEmpty(duplicateCondition?.or) ? '(first: 0)' : `(filter: ${filters})`
    } {
        ${fieldsString}
    }
  `;
  }
}
