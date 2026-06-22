import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';

import { type I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type DatabaseCrudOperation } from 'src/engine/core-modules/tool-provider/constants/database-crud-operation.const';
import { translateToolLabel } from 'src/engine/core-modules/tool-provider/utils/translate-tool-label.util';

const OPERATION_VERBS: Record<
  DatabaseCrudOperation,
  {
    imperative: MessageDescriptor;
    inProgress: MessageDescriptor;
    completed: MessageDescriptor;
  }
> = {
  find_many: {
    imperative: msg`Search`,
    inProgress: msg`Searching`,
    completed: msg`Searched`,
  },
  find_one: {
    imperative: msg`Find`,
    inProgress: msg`Finding`,
    completed: msg`Found`,
  },
  group_by: {
    imperative: msg`Group`,
    inProgress: msg`Grouping`,
    completed: msg`Grouped`,
  },
  create_one: {
    imperative: msg`Create`,
    inProgress: msg`Creating`,
    completed: msg`Created`,
  },
  create_many: {
    imperative: msg`Create`,
    inProgress: msg`Creating`,
    completed: msg`Created`,
  },
  update_one: {
    imperative: msg`Update`,
    inProgress: msg`Updating`,
    completed: msg`Updated`,
  },
  update_many: {
    imperative: msg`Update`,
    inProgress: msg`Updating`,
    completed: msg`Updated`,
  },
  upsert_many: {
    imperative: msg`Upsert`,
    inProgress: msg`Upserting`,
    completed: msg`Upserted`,
  },
  delete_one: {
    imperative: msg`Delete`,
    inProgress: msg`Deleting`,
    completed: msg`Deleted`,
  },
  delete_many: {
    imperative: msg`Delete`,
    inProgress: msg`Deleting`,
    completed: msg`Deleted`,
  },
};

export type CrudToolLabels = {
  label: string;
  inProgressLabel: string;
  completedLabel: string;
};

export const getCrudToolLabels = (
  operation: DatabaseCrudOperation,
  objectLabel: string,
  i18nService: I18nService,
  locale?: keyof typeof APP_LOCALES,
): CrudToolLabels => {
  const i18n = i18nService.getI18nInstance(locale ?? SOURCE_LOCALE);
  const verbs = OPERATION_VERBS[operation];

  const object = translateToolLabel(
    objectLabel,
    i18nService,
    locale,
  ).toLocaleLowerCase(locale);

  return {
    label: `${i18n._(verbs.imperative)} ${object}`,
    inProgressLabel: `${i18n._(verbs.inProgress)} ${object}`,
    completedLabel: `${i18n._(verbs.completed)} ${object}`,
  };
};
