import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

export const checkStringIsDatabaseEventAction = (value: string): boolean => {
  return Object.values(DatabaseEventAction).includes(
    value as DatabaseEventAction,
  );
};
