import { Injectable, Logger } from '@nestjs/common';

import { WorkspaceQueryBuilderOptions } from 'src/engine/api/graphql/workspace-query-builder/interfaces/workspace-query-builder-options.interface';
import {
  Record as IRecord,
  RecordFilter,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import {
  FindManyResolverArgs,
  FindOneResolverArgs,
  CreateManyResolverArgs,
  UpdateOneResolverArgs,
  DeleteOneResolverArgs,
  UpdateManyResolverArgs,
  DeleteManyResolverArgs,
  FindDuplicatesResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { FindManyQueryFactory } from './factories/find-many-query.factory';
import { FindOneQueryFactory } from './factories/find-one-query.factory';
import { CreateManyQueryFactory } from './factories/create-many-query.factory';
import { UpdateOneQueryFactory } from './factories/update-one-query.factory';
import { DeleteOneQueryFactory } from './factories/delete-one-query.factory';
import {
  UpdateManyQueryFactory,
  UpdateManyQueryFactoryOptions,
} from './factories/update-many-query.factory';
import {
  DeleteManyQueryFactory,
  DeleteManyQueryFactoryOptions,
} from './factories/delete-many-query.factory';
import { FindDuplicatesQueryFactory } from './factories/find-duplicates-query.factory';

@Injectable()
export class WorkspaceQueryBuilderFactory {
  private readonly logger = new Logger(WorkspaceQueryBuilderFactory.name);

  constructor(
    private readonly findManyQueryFactory: FindManyQueryFactory,
    private readonly findOneQueryFactory: FindOneQueryFactory,
    private readonly findDuplicatesQueryFactory: FindDuplicatesQueryFactory,
    private readonly createManyQueryFactory: CreateManyQueryFactory,
    private readonly updateOneQueryFactory: UpdateOneQueryFactory,
    private readonly deleteOneQueryFactory: DeleteOneQueryFactory,
    private readonly updateManyQueryFactory: UpdateManyQueryFactory,
    private readonly deleteManyQueryFactory: DeleteManyQueryFactory,
  ) {}

  findMany<
    Filter extends RecordFilter = RecordFilter,
    OrderBy extends RecordOrderBy = RecordOrderBy,
  >(
    args: FindManyResolverArgs<Filter, OrderBy>,
    options: WorkspaceQueryBuilderOptions,
  ): Promise<string> {
    return this.findManyQueryFactory.create<Filter, OrderBy>(args, options);
  }

  findOne<Filter extends RecordFilter = RecordFilter>(
    args: FindOneResolverArgs<Filter>,
    options: WorkspaceQueryBuilderOptions,
  ): Promise<string> {
    return this.findOneQueryFactory.create<Filter>(args, options);
  }

  findDuplicates(
    args: FindDuplicatesResolverArgs,
    options: WorkspaceQueryBuilderOptions,
    existingRecords?: IRecord[],
  ): Promise<string> {
    return this.findDuplicatesQueryFactory.create(
      args,
      options,
      existingRecords,
    );
  }

  createMany<Record extends IRecord = IRecord>(
    args: CreateManyResolverArgs<Partial<Record>>,
    options: WorkspaceQueryBuilderOptions,
  ): Promise<string> {
    return this.createManyQueryFactory.create<Record>(args, options);
  }

  updateOne<Record extends IRecord = IRecord>(
    initialArgs: UpdateOneResolverArgs<Partial<Record>>,
    options: WorkspaceQueryBuilderOptions,
  ): Promise<string> {
    return this.updateOneQueryFactory.create<Record>(initialArgs, options);
  }

  deleteOne(
    args: DeleteOneResolverArgs,
    options: WorkspaceQueryBuilderOptions,
  ): Promise<string> {
    return this.deleteOneQueryFactory.create(args, options);
  }

  updateMany<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(
    args: UpdateManyResolverArgs<Partial<Record>, Filter>,
    options: UpdateManyQueryFactoryOptions,
  ): Promise<string> {
    return this.updateManyQueryFactory.create(args, options);
  }

  deleteMany<Filter extends RecordFilter = RecordFilter>(
    args: DeleteManyResolverArgs<Filter>,
    options: DeleteManyQueryFactoryOptions,
  ): Promise<string> {
    return this.deleteManyQueryFactory.create(args, options);
  }
}
