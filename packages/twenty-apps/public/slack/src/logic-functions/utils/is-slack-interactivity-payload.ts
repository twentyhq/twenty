import { isArray, isObject, isString, isUndefined } from '@sniptt/guards';

import { type SlackInteractivityPayload } from 'src/logic-functions/types/slack-interactivity-payload.type';

const isOptionalString = (value: unknown): value is string | undefined =>
  isUndefined(value) || isString(value);

const isOptionalIdentifiedObject = (value: unknown): boolean =>
  isUndefined(value) ||
  (isObject<Record<string, unknown>, unknown>(value) &&
    isOptionalString(value.id));

const isInteractionAction = (value: unknown): boolean =>
  isObject<Record<string, unknown>, unknown>(value) &&
  isOptionalString(value.type) &&
  isOptionalString(value.action_id) &&
  isOptionalString(value.block_id) &&
  isOptionalString(value.value) &&
  isOptionalString(value.action_ts);

export const isSlackInteractivityPayload = (
  value: unknown,
): value is SlackInteractivityPayload => {
  if (!isObject<Record<string, unknown>, unknown>(value)) {
    return false;
  }

  return (
    isOptionalString(value.type) &&
    isOptionalIdentifiedObject(value.team) &&
    isOptionalIdentifiedObject(value.user) &&
    (isUndefined(value.actions) ||
      (isArray(value.actions) && value.actions.every(isInteractionAction)))
  );
};
