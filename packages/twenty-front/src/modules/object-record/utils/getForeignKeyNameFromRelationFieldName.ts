import { doNotTranslate } from 'twenty-shared/i18n';

export const getForeignKeyNameFromRelationFieldName = (nameSingular: string) =>
  doNotTranslate(`${nameSingular}Id`);
