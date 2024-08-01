import { QueryResultGettersFactory } from './query-result-getters/query-result-getters.factory';
import { QueryRunnerArgsFactory } from './query-runner-args.factory';
import { RecordPositionFactory } from './record-position.factory';

export const workspaceQueryRunnerFactories = [
  QueryRunnerArgsFactory,
  RecordPositionFactory,
  QueryResultGettersFactory,
];
