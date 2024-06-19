import { Injectable, Logger } from '@nestjs/common';

import isEmpty from 'lodash.isempty';

import { WorkspaceQueryBuilderOptions } from 'src/engine/api/graphql/workspace-query-builder/interfaces/workspace-query-builder-options.interface';
import { RecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
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

    const duplicateCondition = this.duplicateService.buildDuplicateCondition(
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
}
