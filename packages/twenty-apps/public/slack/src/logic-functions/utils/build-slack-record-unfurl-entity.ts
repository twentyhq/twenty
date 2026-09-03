import { type EntityMetadata } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackUnfurlObjectName } from 'src/logic-functions/types/slack-unfurl-object-name.type';
import { type SlackRecordLink } from 'src/logic-functions/types/slack-record-link.type';
import { SLACK_RECORD_CONTENT_BUILDERS } from 'src/logic-functions/utils/build-slack-record-content';
import { toEpochSeconds } from 'src/logic-functions/utils/to-epoch-seconds';

const ITEM_ENTITY_TYPE = 'slack#/entities/item';
const TASK_ENTITY_TYPE = 'slack#/entities/task';

const ENTITY_TYPE_BY_OBJECT: Record<SlackUnfurlObjectName, string> = {
  person: ITEM_ENTITY_TYPE,
  company: ITEM_ENTITY_TYPE,
  opportunity: ITEM_ENTITY_TYPE,
  note: ITEM_ENTITY_TYPE,
  task: TASK_ENTITY_TYPE,
};

const TWENTY_PRODUCT_ICON_URL =
  'https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-front/public/images/icons/ios/192.png';

const DISPLAY_TYPE_BY_OBJECT: Record<SlackUnfurlObjectName, string> = {
  person: 'Person',
  company: 'Company',
  opportunity: 'Opportunity',
  note: 'Note',
  task: 'Task',
};

export const buildSlackRecordUnfurlEntity = ({
  recordLink,
  record,
  workspaceBaseUrls,
  includeDetails = false,
}: {
  recordLink: SlackRecordLink;
  record: Record<string, unknown>;
  workspaceBaseUrls: string[];
  includeDetails?: boolean;
}): EntityMetadata | undefined => {
  const { title, customFields, fields, iconUrl } = SLACK_RECORD_CONTENT_BUILDERS[
    recordLink.objectNameSingular
  ]({ record, workspaceBaseUrls, includeDetails });

  if (!isNonEmptyString(title)) {
    return undefined;
  }

  const definedCustomFields = customFields.filter(isDefined);
  const metadataLastModified = toEpochSeconds(record.updatedAt);

  return {
    entity_type: ENTITY_TYPE_BY_OBJECT[recordLink.objectNameSingular],
    entity_payload: {
      attributes: {
        title: { text: title },
        display_type: DISPLAY_TYPE_BY_OBJECT[recordLink.objectNameSingular],
        product_name: 'Twenty',
        product_icon: isDefined(iconUrl)
          ? { alt_text: title, url: iconUrl }
          : { alt_text: 'Twenty', url: TWENTY_PRODUCT_ICON_URL },
        ...(isDefined(metadataLastModified)
          ? { metadata_last_modified: metadataLastModified }
          : {}),
      },
      ...(isDefined(fields) ? { fields } : {}),
      ...(definedCustomFields.length > 0
        ? { custom_fields: definedCustomFields }
        : {}),
    },
    external_ref: {
      id: recordLink.recordId,
      type: recordLink.objectNameSingular,
    },
    url: recordLink.canonicalUrl,
    app_unfurl_url: recordLink.sharedUrl,
  };
};
