import { Injectable } from '@nestjs/common';

import { WorkspaceQueryBuilderOptions } from 'src/engine/api/graphql/workspace-query-builder/interfaces/workspace-query-builder-options.interface';
import { SearchResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { ArgsStringFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/args-string.factory';
import { FieldsStringFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/fields-string.factory';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

@Injectable()
export class SearchQueryFactory {
  constructor(
    private readonly fieldsStringFactory: FieldsStringFactory,
    private readonly argsStringFactory: ArgsStringFactory,
  ) {}

  async create(
    args: SearchResolverArgs,
    options: WorkspaceQueryBuilderOptions,
  ) {
    const fieldsString = await this.fieldsStringFactory.create(
      options.info,
      options.fieldMetadataCollection,
      options.objectMetadataCollection,
    );
    const argsString = this.argsStringFactory.create(
      args,
      options.fieldMetadataCollection,
      !options.withSoftDeleted,
    );

    return `
      query {
        ${computeObjectTargetTable(options.objectMetadataItem)}Collection${
          argsString ? `(${argsString})` : ''
        } {
          ${fieldsString}
        }
      }
    `;
  }
}
