import { type EntityCustomField } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ENTITY_FIELD_TYPE } from 'src/logic-functions/constants/slack-entity-field-type';
import { readSlackBodyPreview } from 'src/logic-functions/utils/read-slack-body-preview';

export const buildSlackBodyPreviewField = (
  bodyValue: unknown,
): EntityCustomField | undefined => {
  const preview = readSlackBodyPreview({ bodyValue });

  return isDefined(preview)
    ? {
        key: 'body',
        label: 'Body',
        type: SLACK_ENTITY_FIELD_TYPE.STRING,
        value: preview,
        long: true,
      }
    : undefined;
};
