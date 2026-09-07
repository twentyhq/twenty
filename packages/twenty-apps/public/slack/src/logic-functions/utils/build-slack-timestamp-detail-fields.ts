import { type EntityCustomField } from '@slack/web-api';

import { buildSlackTimestampField } from 'src/logic-functions/utils/build-slack-timestamp-field';

export const buildSlackTimestampDetailFields = (
  record: Record<string, unknown>,
): (EntityCustomField | undefined)[] => [
  buildSlackTimestampField({
    key: 'createdAt',
    label: 'Created',
    value: record.createdAt,
  }),
  buildSlackTimestampField({
    key: 'updatedAt',
    label: 'Updated',
    value: record.updatedAt,
  }),
];
