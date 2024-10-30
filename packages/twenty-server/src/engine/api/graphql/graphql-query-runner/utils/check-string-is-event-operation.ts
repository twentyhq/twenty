import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';

export const checkStringIsEventOperation = (value: string): boolean => {
  return Object.values(DatabaseEventAction).includes(
    value as DatabaseEventAction,
  );
};
