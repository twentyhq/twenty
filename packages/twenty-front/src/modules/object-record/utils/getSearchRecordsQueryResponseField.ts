import { capitalize } from 'twenty-shared/utils';
export const getSearchRecordsQueryResponseField = (objectNamePlural: string) =>
  `search${capitalize(objectNamePlural)}`;
