import { type EntityMetadata } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackUnfurlObjectName } from 'src/logic-functions/constants/slack-unfurl-object-names';
import { type SlackRecordLink } from 'src/logic-functions/types/slack-record-link.type';
import { SLACK_RECORD_CONTENT_BUILDERS } from 'src/logic-functions/utils/build-slack-record-content';
import { toEpochSeconds } from 'src/logic-functions/utils/coerce-record-field-value';

const ITEM_ENTITY_TYPE = 'slack#/entities/item';

// Slack fetches the icon itself, so it must be a public URL: the workspace's
// own instance may not be reachable from Slack (self-hosted, local dev).
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
  workspaceBaseUrl,
  includeDetails = false,
}: {
  recordLink: SlackRecordLink;
  record: Record<string, unknown>;
  workspaceBaseUrl: string;
  // The flexpane has room for the full field set; the in-channel card
  // stays to the headline fields.
  includeDetails?: boolean;
}): EntityMetadata | undefined => {
  const { title, customFields, iconUrl } = SLACK_RECORD_CONTENT_BUILDERS[
    recordLink.objectNameSingular
  ]({ record, workspaceBaseUrl, includeDetails });

  if (!isNonEmptyString(title)) {
    return undefined;
  }

  const definedCustomFields = customFields.filter(isDefined);
  const metadataLastModified = toEpochSeconds(record.updatedAt);

  return {
    entity_type: ITEM_ENTITY_TYPE,
    entity_payload: {
      attributes: {
        title: { text: title },
        display_type: DISPLAY_TYPE_BY_OBJECT[recordLink.objectNameSingular],
        product_name: 'Twenty',
        // The record's own logo when it has one (company favicon, public
        // avatar), so the card is recognizable at a glance; the Twenty mark
        // otherwise.
        product_icon: isDefined(iconUrl)
          ? { alt_text: title, url: iconUrl }
          : { alt_text: 'Twenty', url: TWENTY_PRODUCT_ICON_URL },
        ...(isDefined(metadataLastModified)
          ? { metadata_last_modified: metadataLastModified }
          : {}),
      },
      ...(definedCustomFields.length > 0
        ? { custom_fields: definedCustomFields }
        : {}),
    },
    // The type makes the flexpane request self-describing: Slack echoes the
    // external_ref back in entity_details_requested.
    external_ref: {
      id: recordLink.recordId,
      type: recordLink.objectNameSingular,
    },
    url: recordLink.url,
    app_unfurl_url: recordLink.url,
  };
};
