import { doNotTranslate } from 'twenty-shared/i18n';

export const getFindDuplicateRecordsQueryResponseField = (
  objectNameSingular: string,
) => doNotTranslate(`${objectNameSingular}Duplicates`);
