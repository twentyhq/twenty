import { Injectable, Logger } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { WorkspaceQueryBuilderOptions } from 'src/engine/api/graphql/workspace-query-builder/interfaces/workspace-query-builder-options.interface';
import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { stringifyWithoutKeyQuote } from 'src/engine/api/graphql/workspace-query-builder/utils/stringify-without-key-quote.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

import { FieldsStringFactory } from './fields-string.factory';
import { ArgsAliasFactory } from './args-alias.factory';

@Injectable()
export class CreateManyQueryFactory {
  private readonly logger = new Logger(CreateManyQueryFactory.name);

  constructor(
    private readonly fieldsStringFactory: FieldsStringFactory,
    private readonly argsAliasFactory: ArgsAliasFactory,
  ) {}

  async create<Record extends IRecord = IRecord>(
    args: CreateManyResolverArgs<Partial<Record>>,
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

    return `
      mutation {
        insertInto${computeObjectTargetTable(
          options.objectMetadataItem,
        )}Collection(objects: ${stringifyWithoutKeyQuote(
          computedArgs.data.map((datum) => ({
            id: uuidv4(),
            ...datum,
          })),
        )}) {
          affectedCount
          records {
            ${fieldsString}
          }
        }
      }
    `;
  }
}
