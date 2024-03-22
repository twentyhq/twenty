import { QueryResultGettersFactory } from './query-result-getters.factory';
import { RecordPositionFactory } from './record-position.factory';
import { QueryRunnerArgsFactory } from './query-runner-args.factory';

export const workspaceQueryRunnerFactories = [
  QueryRunnerArgsFactory,
  RecordPositionFactory,
  QueryResultGettersFactory,
];
