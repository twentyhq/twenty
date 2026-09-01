import { type EntityCustomField } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import { SLACK_ENTITY_FIELD_TYPE } from 'src/logic-functions/constants/slack-entity-field-type';
import { asNonEmptyString } from 'src/logic-functions/utils/as-non-empty-string';
import { asObject } from 'src/logic-functions/utils/as-object';

const BODY_PREVIEW_MAX_LENGTH = 300;

export const buildSlackBodyPreviewField = (
  bodyValue: unknown,
): EntityCustomField | undefined => {
  const markdown = asNonEmptyString(asObject(bodyValue)?.markdown)?.trim();

  if (!isNonEmptyString(markdown)) {
    return undefined;
  }

  const codePoints = [...markdown];

  const preview =
    codePoints.length > BODY_PREVIEW_MAX_LENGTH
      ? `${codePoints.slice(0, BODY_PREVIEW_MAX_LENGTH).join('')}…`
      : markdown;

  return {
    key: 'body',
    label: 'Body',
    type: SLACK_ENTITY_FIELD_TYPE.STRING,
    value: preview,
    long: true,
  };
};
