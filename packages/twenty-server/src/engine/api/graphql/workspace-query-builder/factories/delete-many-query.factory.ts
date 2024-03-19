import { Injectable } from '@nestjs/common';

import { WorkspaceQueryBuilderOptions } from 'src/engine/api/graphql/workspace-query-builder/interfaces/workspace-query-builder-options.interface';
import { DeleteManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { stringifyWithoutKeyQuote } from 'src/engine/api/graphql/workspace-query-builder/utils/stringify-without-key-quote.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

import { FieldsStringFactory } from './fields-string.factory';

export interface DeleteManyQueryFactoryOptions
  extends WorkspaceQueryBuilderOptions {
  atMost?: number;
}

@Injectable()
export class DeleteManyQueryFactory {
  constructor(private readonly fieldsStringFactory: FieldsStringFactory) {}

  async create(
    args: DeleteManyResolverArgs,
    options: DeleteManyQueryFactoryOptions,
  ) {
    const fieldsString = await this.fieldsStringFactory.create(
      options.info,
      options.fieldMetadataCollection,
      options.objectMetadataCollection,
    );

    return `
      mutation {
        deleteFrom${computeObjectTargetTable(
          options.objectMetadataItem,
        )}Collection(filter: ${stringifyWithoutKeyQuote(
          args.filter,
        )}, atMost: ${options.atMost ?? 1}) {
          affectedCount
          records {
            ${fieldsString}
          }
        }
      }
    `;
  }
}
