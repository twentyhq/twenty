import { doNotTranslate } from 'twenty-shared/utils';

export const getForeignKeyNameFromRelationFieldName = (nameSingular: string) =>
  doNotTranslate(`${nameSingular}Id`);
