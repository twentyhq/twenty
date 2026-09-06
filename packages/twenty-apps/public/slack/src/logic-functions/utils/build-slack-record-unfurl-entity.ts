import { type EntityMetadata } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackUnfurlObjectName } from 'src/logic-functions/types/slack-unfurl-object-name.type';
import { type SlackRecordLink } from 'src/logic-functions/types/slack-record-link.type';
import { SLACK_RECORD_CONTENT_BUILDERS } from 'src/logic-functions/utils/build-slack-record-content';
import { buildSlackEntityPayloadFields } from 'src/logic-functions/utils/build-slack-entity-payload-fields';
import { toEpochSeconds } from 'src/logic-functions/utils/to-epoch-seconds';

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
  const content = SLACK_RECORD_CONTENT_BUILDERS[recordLink.objectNameSingular]({
    record,
    workspaceBaseUrls,
    includeDetails,
  });

  if (!isNonEmptyString(content.title)) {
    return undefined;
  }

  const metadataLastModified = toEpochSeconds(record.updatedAt);

  return {
    entity_type: content.entityType,
    entity_payload: {
      attributes: {
        title: { text: content.title },
        display_type: DISPLAY_TYPE_BY_OBJECT[recordLink.objectNameSingular],
        product_name: 'Twenty',
        product_icon: isDefined(content.iconUrl)
          ? { alt_text: content.title, url: content.iconUrl }
          : { alt_text: 'Twenty', url: TWENTY_PRODUCT_ICON_URL },
        ...(isDefined(metadataLastModified)
          ? { metadata_last_modified: metadataLastModified }
          : {}),
      },
      ...buildSlackEntityPayloadFields(content),
    },
    external_ref: {
      id: recordLink.recordId,
      type: recordLink.objectNameSingular,
    },
    url: recordLink.canonicalUrl,
    app_unfurl_url: recordLink.sharedUrl,
  };
};
