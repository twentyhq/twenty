import { type EntityCustomField } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ENTITY_FIELD_TYPE } from 'src/logic-functions/constants/slack-entity-field-type';
import { type SlackUnfurlObjectName } from 'src/logic-functions/types/slack-unfurl-object-name.type';

export const buildSlackRecordRefField = ({
  key,
  label,
  objectNameSingular,
  recordId,
  title,
  iconUrl,
  workspaceBaseUrl,
}: {
  key: string;
  label: string;
  objectNameSingular: SlackUnfurlObjectName;
  recordId: string;
  title: string;
  iconUrl?: string;
  workspaceBaseUrl: string;
}): EntityCustomField => ({
  key,
  label,
  type: SLACK_ENTITY_FIELD_TYPE.ENTITY_REF,
  entity_ref: {
    entity_url: `${workspaceBaseUrl}/object/${objectNameSingular}/${recordId}`,
    external_ref: { id: recordId, type: objectNameSingular },
    title,
    ...(isDefined(iconUrl) ? { icon: { alt_text: title, url: iconUrl } } : {}),
  },
});
