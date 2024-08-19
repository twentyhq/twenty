import { Injectable, Logger } from '@nestjs/common';

import { WorkspaceQueryBuilderOptions } from 'src/engine/api/graphql/workspace-query-builder/interfaces/workspace-query-builder-options.interface';
import { RecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { FindOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

import { ArgsStringFactory } from './args-string.factory';
import { FieldsStringFactory } from './fields-string.factory';

@Injectable()
export class FindOneQueryFactory {
  private readonly logger = new Logger(FindOneQueryFactory.name);

  constructor(
    private readonly fieldsStringFactory: FieldsStringFactory,
    private readonly argsStringFactory: ArgsStringFactory,
  ) {}

  async create<Filter extends RecordFilter = RecordFilter>(
    args: FindOneResolverArgs<Filter>,
    options: WorkspaceQueryBuilderOptions,
  ) {
    const fieldsString = await this.fieldsStringFactory.create(
      options.info,
      options.fieldMetadataCollection,
      options.objectMetadataCollection,
      options.withSoftDeleted,
    );
    const argsString = this.argsStringFactory.create(
      args,
      options.fieldMetadataCollection,
      !options.withSoftDeleted && !!options.objectMetadataItem.isSoftDeletable,
    );

    return `
      query {
        ${computeObjectTargetTable(options.objectMetadataItem)}Collection${
          argsString ? `(${argsString})` : ''
        } {
          edges {
            node {
              ${fieldsString}
            }
          }
        }
      }
    `;
  }
}
