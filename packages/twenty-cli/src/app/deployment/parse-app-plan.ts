import {
  isArray,
  isNonEmptyString,
  isString,
  isNull,
  isUndefined,
} from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { isSupportedLocale } from '@/app/translations/is-supported-locale';
import { isSameUniversalIdentifier } from '@/app/is-same-universal-identifier';
import {
  type AppPlanAction,
  type AppPlan,
  type AppTranslationPlanAction,
} from '@/app/deployment/types/app-plan.type';
import { CliError } from '@/output/cli-error';
import { RESULT_ITEM_LIMIT } from '@/transport/constants/result-item-limit.constant';

const isAction = (value: unknown): value is AppPlanAction =>
  isPlainObject(value) &&
  (value.type === 'create' ||
    value.type === 'update' ||
    value.type === 'delete') &&
  isNonEmptyString(value.metadataName) &&
  (value.type === 'create'
    ? isUndefined(value.universalIdentifier) ||
      isNonEmptyString(value.universalIdentifier)
    : isNonEmptyString(value.universalIdentifier)) &&
  (isUndefined(value.flatEntity) || isPlainObject(value.flatEntity)) &&
  (isUndefined(value.diff) ||
    (isPlainObject(value.diff) &&
      Object.values(value.diff).every(isPlainObject)));

const isTranslationAction = (
  value: unknown,
): value is AppTranslationPlanAction =>
  isPlainObject(value) &&
  (value.type === 'create' ||
    value.type === 'update' ||
    value.type === 'delete') &&
  value.metadataName === 'applicationTranslation' &&
  isString(value.locale) &&
  isSupportedLocale(value.locale) &&
  isPlainObject(value.diff) &&
  Object.values(value.diff).every(
    (change) =>
      isPlainObject(change) &&
      (isString(change.before) || isNull(change.before)) &&
      (isString(change.after) || isNull(change.after)),
  );

const redactVariableValues = (action: AppPlanAction): AppPlanAction => {
  if (action.metadataName !== 'applicationVariable') {
    return action;
  }

  return {
    ...action,
    ...(isDefined(action.flatEntity) && 'value' in action.flatEntity
      ? { flatEntity: { ...action.flatEntity, value: '(redacted)' } }
      : {}),
    ...(isDefined(action.diff) && 'value' in action.diff
      ? {
          diff: {
            ...action.diff,
            value: { before: '(redacted)', after: '(redacted)' },
          },
        }
      : {}),
  };
};

export const parseAppPlan = ({
  value,
  applicationUniversalIdentifier,
  translationLabels,
}: {
  value: unknown;
  applicationUniversalIdentifier: string;
  translationLabels?: Record<string, string>;
}): AppPlan => {
  if (
    !isPlainObject(value) ||
    !isSameUniversalIdentifier({
      value: value.applicationUniversalIdentifier,
      universalIdentifier: applicationUniversalIdentifier,
    }) ||
    !isArray(value.actions) ||
    !value.actions.every(isAction) ||
    (!isNull(value.translationActions) &&
      (!isArray(value.translationActions) ||
        !value.translationActions.every(isTranslationAction)))
  ) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: 'The server returned an invalid application plan.',
    });
  }

  if (
    value.actions.length + (value.translationActions?.length ?? 0) >
    RESULT_ITEM_LIMIT
  ) {
    throw new CliError({
      code: 'RESPONSE_LIMIT_EXCEEDED',
      message: `The application plan exceeds ${RESULT_ITEM_LIMIT} actions.`,
      hint: 'Reduce the app changes before requesting another plan.',
    });
  }

  return {
    actions: value.actions.map(redactVariableValues),
    translationActions:
      value.translationActions?.map((action) => ({
        ...action,
        messageLabels: Object.fromEntries(
          Object.keys(action.diff).flatMap((messageId) => {
            const label = translationLabels?.[messageId];
            return isDefined(label) ? [[messageId, label]] : [];
          }),
        ),
      })) ?? null,
  };
};
