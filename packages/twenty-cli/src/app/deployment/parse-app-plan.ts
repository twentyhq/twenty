import { isArray, isNonEmptyString, isUndefined } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { isSameUniversalIdentifier } from '@/app/is-same-universal-identifier';
import { type AppPlanAction } from '@/app/deployment/types/app-plan.type';
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
}: {
  value: unknown;
  applicationUniversalIdentifier: string;
}) => {
  if (
    !isPlainObject(value) ||
    !isSameUniversalIdentifier({
      value: value.applicationUniversalIdentifier,
      universalIdentifier: applicationUniversalIdentifier,
    }) ||
    !isArray(value.actions) ||
    !value.actions.every(isAction)
  ) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: 'The server returned an invalid application plan.',
    });
  }

  if (value.actions.length > RESULT_ITEM_LIMIT) {
    throw new CliError({
      code: 'RESPONSE_LIMIT_EXCEEDED',
      message: `The application plan exceeds ${RESULT_ITEM_LIMIT} actions.`,
      hint: 'Reduce the app changes before requesting another plan.',
    });
  }

  return value.actions.map(redactVariableValues);
};
