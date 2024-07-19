import { Injectable, Logger } from '@nestjs/common';

import { WorkspaceQueryBuilderOptions } from 'src/engine/api/graphql/workspace-query-builder/interfaces/workspace-query-builder-options.interface';
import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { stringifyWithoutKeyQuote } from 'src/engine/api/graphql/workspace-query-builder/utils/stringify-without-key-quote.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

import { FieldsStringFactory } from './fields-string.factory';
import { ArgsAliasFactory } from './args-alias.factory';

@Injectable()
export class UpdateOneQueryFactory {
  private readonly logger = new Logger(UpdateOneQueryFactory.name);

  constructor(
    private readonly fieldsStringFactory: FieldsStringFactory,
    private readonly argsAliasFactory: ArgsAliasFactory,
  ) {}

  async create<Record extends IRecord = IRecord>(
    args: UpdateOneResolverArgs<Partial<Record>>,
    options: WorkspaceQueryBuilderOptions,
  ) {
    const fieldsString = await this.fieldsStringFactory.create(
      options.info,
      options.fieldMetadataCollection,
      options.objectMetadataCollection,
    );
    const computedArgs = this.argsAliasFactory.create(
      args,
      options.fieldMetadataCollection,
    );

    const argsData = {
      ...computedArgs.data,
      id: undefined, // do not allow updating an existing object's id
      updatedAt: new Date().toISOString(),
    };

    return `
      mutation {
        update${computeObjectTargetTable(
          options.objectMetadataItem,
        )}Collection(set: ${stringifyWithoutKeyQuote(
          argsData,
        )}, filter: { id: { eq: "${computedArgs.id}" } }) {
          affectedCount
          records {
            ${fieldsString}
          }
        }
      }
    `;
  }
}
