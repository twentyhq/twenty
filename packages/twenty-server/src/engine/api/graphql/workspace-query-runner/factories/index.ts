import { QueryRunnerArgsFactory } from './query-runner-args.factory';
import { RecordPositionFactory } from './record-position.factory';

import { QueryResultGettersFactory } from './query-result-getters/query-result-getters.factory';

export const workspaceQueryRunnerFactories = [
  QueryRunnerArgsFactory,
  RecordPositionFactory,
  QueryResultGettersFactory,
];
