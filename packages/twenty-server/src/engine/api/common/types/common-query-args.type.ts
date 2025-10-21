import {
  type ObjectRecord,
  type OrderByWithGroupBy,
} from 'twenty-shared/types';

import {
  type ObjectRecordFilter,
  type ObjectRecordGroupBy,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';

export enum CommonQueryNames {
  findOne = 'findOne',
  findMany = 'findMany',
  findDuplicates = 'findDuplicates',
  createMany = 'createMany',
  groupBy = 'groupBy',
  createOne = 'createOne',
  updateOne = 'updateOne',
  updateMany = 'updateMany',
}

export interface FindOneQueryArgs {
  selectedFields: CommonSelectedFields;
  filter?: ObjectRecordFilter;
}

export interface FindManyQueryArgs {
  selectedFields: CommonSelectedFields;
  filter?: ObjectRecordFilter;
  orderBy?: ObjectRecordOrderBy;
  first?: number;
  last?: number;
  before?: string;
  after?: string;
}

export interface CreateManyQueryArgs {
  selectedFields: CommonSelectedFields;
  data: Partial<ObjectRecord>[];
  upsert?: boolean;
}

export interface CreateOneQueryArgs {
  selectedFields: CommonSelectedFields;
  data: Partial<ObjectRecord>;
  upsert?: boolean;
}
export interface GroupByQueryArgs {
  selectedFields: CommonSelectedFields;
  filter?: ObjectRecordFilter;
  orderBy?: OrderByWithGroupBy;
  groupBy: ObjectRecordGroupBy;
  omitNullValues?: boolean;
  viewId?: string;
}

export interface UpdateOneQueryArgs {
  selectedFields: CommonSelectedFields;
  id: string;
  data: Partial<ObjectRecord>;
}

export interface UpdateManyQueryArgs {
  selectedFields: CommonSelectedFields;
  filter: ObjectRecordFilter;
  data: Partial<ObjectRecord>;
}

export interface FindDuplicatesQueryArgs {
  selectedFields: CommonSelectedFields;
  data?: Partial<ObjectRecord>[];
  ids?: string[];
}
