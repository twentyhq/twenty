import { ForeignDataWrapperServerQueryFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/foreign-data-wrapper-server-query.factory';

import { RecordPositionQueryFactory } from './record-position-query.factory';

export const workspaceQueryBuilderFactories = [
  RecordPositionQueryFactory,
  ForeignDataWrapperServerQueryFactory,
];
