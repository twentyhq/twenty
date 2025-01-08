import { capitalize } from 'twenty-shared';

export const getSearchRecordsQueryResponseField = (objectNamePlural: string) =>
  `search${capitalize(objectNamePlural)}`;
