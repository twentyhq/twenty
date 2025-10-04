import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type Depth } from 'src/engine/api/rest/input-factories/depth-input.factory';

export enum CommonQueryNames {
  findOne = 'findOne',
}

export type RawSelectedFields = {
  graphqlSelectedFields?: Record<string, boolean>;
  depth?: Depth;
};

export interface FindOneQueryArgs {
  filter?: ObjectRecordFilter;
}

export type CommonQueryArgs = FindOneQueryArgs;
