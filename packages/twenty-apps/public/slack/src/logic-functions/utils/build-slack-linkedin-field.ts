import { type EntityCustomField } from '@slack/web-api';

import { SLACK_ENTITY_FIELD_TYPE } from 'src/logic-functions/constants/slack-entity-field-type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { buildSlackStringField } from 'src/logic-functions/utils/build-slack-string-field';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';
import { toAbsoluteHttpUrl } from 'src/logic-functions/utils/to-absolute-http-url';

export const buildSlackLinkedinField = (
  record: Record<string, unknown>,
): EntityCustomField | undefined =>
  buildSlackStringField({
    key: 'linkedin',
    label: 'LinkedIn',
    value: toAbsoluteHttpUrl(
      readOptionalString(asRecord(record.linkedinLink)?.primaryLinkUrl),
    ),
    type: SLACK_ENTITY_FIELD_TYPE.LINK,
  });
