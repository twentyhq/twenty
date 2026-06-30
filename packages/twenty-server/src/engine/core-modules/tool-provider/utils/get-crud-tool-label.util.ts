import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';

import { type I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type DatabaseCrudOperation } from 'src/engine/core-modules/tool-provider/constants/database-crud-operation.const';
import { translateToolLabel } from 'src/engine/core-modules/tool-provider/utils/translate-tool-label.util';

const OPERATION_VERBS: Record<DatabaseCrudOperation, MessageDescriptor> = {
  find_many: msg`Search`,
  find_one: msg`Find`,
  group_by: msg`Group`,
  create_one: msg`Create`,
  create_many: msg`Create`,
  update_one: msg`Update`,
  update_many: msg`Update`,
  upsert_many: msg`Upsert`,
  delete_one: msg`Delete`,
  delete_many: msg`Delete`,
};

type CrudToolLabel = {
  label: string;
};

export const getCrudToolLabels = (
  operation: DatabaseCrudOperation,
  objectLabel: string,
  i18nService: I18nService,
  locale?: keyof typeof APP_LOCALES,
): CrudToolLabel => {
  const i18n = i18nService.getI18nInstance(locale ?? SOURCE_LOCALE);
  const verb = OPERATION_VERBS[operation];

  const object = translateToolLabel(
    objectLabel,
    i18nService,
    locale,
  ).toLocaleLowerCase(locale);

  return {
    label: `${i18n._(verb)} ${object}`,
  };
};
