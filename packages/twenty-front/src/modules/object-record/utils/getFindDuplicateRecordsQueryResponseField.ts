import { doNotTranslate } from 'twenty-shared/utils';

export const getFindDuplicateRecordsQueryResponseField = (
  objectNameSingular: string,
) => doNotTranslate(`${objectNameSingular}Duplicates`);
