import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

export const checkStringIsDatabaseEventAction = (
  value: string,
): value is DatabaseEventAction => {
  return Object.values(DatabaseEventAction).includes(
    value as DatabaseEventAction,
  );
};
