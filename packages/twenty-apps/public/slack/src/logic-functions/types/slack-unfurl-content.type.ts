import { type EntityCustomField, type TaskEntityFields } from '@slack/web-api';

import { type SLACK_ENTITY_TYPE } from 'src/logic-functions/constants/slack-entity-type';

type SlackUnfurlContentAttributes = {
  title: string;
  iconUrl?: string;
};

export type SlackUnfurlContent = SlackUnfurlContentAttributes &
  (
    | {
        entityType: (typeof SLACK_ENTITY_TYPE)['ITEM'];
        customFields: (EntityCustomField | undefined)[];
      }
    | {
        entityType: (typeof SLACK_ENTITY_TYPE)['TASK'];
        fields: TaskEntityFields;
      }
  );
