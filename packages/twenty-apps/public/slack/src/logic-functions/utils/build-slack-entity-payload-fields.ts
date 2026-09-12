import { type EntityMetadata } from '@slack/web-api';
import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ENTITY_TYPE } from 'src/logic-functions/constants/slack-entity-type';
import { type SlackUnfurlContent } from 'src/logic-functions/types/slack-unfurl-content.type';

export const buildSlackEntityPayloadFields = (
  content: SlackUnfurlContent,
): Pick<EntityMetadata['entity_payload'], 'fields' | 'custom_fields'> => {
  if (content.entityType === SLACK_ENTITY_TYPE.TASK) {
    return isNonEmptyArray(Object.keys(content.fields))
      ? { fields: content.fields }
      : {};
  }

  const definedCustomFields = content.customFields.filter(isDefined);

  return isNonEmptyArray(definedCustomFields)
    ? { custom_fields: definedCustomFields }
    : {};
};
