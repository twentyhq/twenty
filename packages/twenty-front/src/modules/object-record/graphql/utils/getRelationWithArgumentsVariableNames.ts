import { doNotTranslate } from 'twenty-shared/i18n';

export const getRelationWithArgumentsVariableNames = (responseKey: string) => ({
  filter: doNotTranslate(`${responseKey}Filter`),
  orderBy: doNotTranslate(`${responseKey}OrderBy`),
  first: doNotTranslate(`${responseKey}First`),
});
