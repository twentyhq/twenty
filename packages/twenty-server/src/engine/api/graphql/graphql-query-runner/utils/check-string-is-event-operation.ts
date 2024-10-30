import { EventOperation } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';

export const checkStringIsEventOperation = (value: string): boolean => {
  return Object.values(EventOperation).includes(value as EventOperation);
};
