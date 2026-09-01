import { type EntityCustomField } from '@slack/web-api';

import { SLACK_ENTITY_FIELD_TYPE } from 'src/logic-functions/constants/slack-entity-field-type';
import { asNonEmptyString } from 'src/logic-functions/utils/as-non-empty-string';
import { asObject } from 'src/logic-functions/utils/as-object';
import { buildSlackStringField } from 'src/logic-functions/utils/build-slack-string-field';
import { toAbsoluteHttpUrl } from 'src/logic-functions/utils/to-absolute-http-url';

export const buildSlackLinkedinField = (
  record: Record<string, unknown>,
): EntityCustomField | undefined =>
  buildSlackStringField({
    key: 'linkedin',
    label: 'LinkedIn',
    value: toAbsoluteHttpUrl(
      asNonEmptyString(asObject(record.linkedinLink)?.primaryLinkUrl),
    ),
    type: SLACK_ENTITY_FIELD_TYPE.LINK,
  });
