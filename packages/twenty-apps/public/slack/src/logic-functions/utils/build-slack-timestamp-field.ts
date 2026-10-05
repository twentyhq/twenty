import { type EntityCustomField } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ENTITY_FIELD_TYPE } from 'src/logic-functions/constants/slack-entity-field-type';
import { toEpochSeconds } from 'src/logic-functions/utils/to-epoch-seconds';

export const buildSlackTimestampField = ({
  key,
  label,
  value,
}: {
  key: string;
  label: string;
  value: unknown;
}): EntityCustomField | undefined => {
  const epochSeconds = toEpochSeconds(value);

  return isDefined(epochSeconds)
    ? {
        key,
        label,
        type: SLACK_ENTITY_FIELD_TYPE.TIMESTAMP,
        value: epochSeconds,
      }
    : undefined;
};
