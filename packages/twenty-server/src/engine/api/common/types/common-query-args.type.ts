import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';

export enum CommonQueryNames {
  findOne = 'findOne',
}

export interface FindOneQueryArgs {
  selectedFieldsResult: CommonSelectedFieldsResult;
  filter?: ObjectRecordFilter;
}

export type CommonQueryArgs = FindOneQueryArgs;
