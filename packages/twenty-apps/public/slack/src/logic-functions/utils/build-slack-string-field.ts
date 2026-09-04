import { type EntityCustomField } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ENTITY_FIELD_TYPE } from 'src/logic-functions/constants/slack-entity-field-type';

export const buildSlackStringField = ({
  key,
  label,
  value,
  type = SLACK_ENTITY_FIELD_TYPE.STRING,
}: {
  key: string;
  label: string;
  value: string | undefined;
  type?: string;
}): EntityCustomField | undefined =>
  isDefined(value) ? { key, label, type, value } : undefined;
