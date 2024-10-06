import { capitalize } from '~/utils/string/capitalize';

export const getSearchRecordsQueryResponseField = (objectNamePlural: string) =>
  `search${capitalize(objectNamePlural)}`;
