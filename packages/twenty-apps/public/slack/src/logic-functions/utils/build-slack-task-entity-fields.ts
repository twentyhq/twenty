import { type TaskEntityFields } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ENTITY_FIELD_TYPE } from 'src/logic-functions/constants/slack-entity-field-type';
import { SLACK_TASK_DESCRIPTION_MAX_LENGTH } from 'src/logic-functions/constants/slack-task-description-max-length';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { buildFullName } from 'src/logic-functions/utils/build-full-name';
import { humanizeSelectValue } from 'src/logic-functions/utils/humanize-select-value';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';
import { readSlackBodyPreview } from 'src/logic-functions/utils/read-slack-body-preview';
import { toEpochSeconds } from 'src/logic-functions/utils/to-epoch-seconds';

export const buildSlackTaskEntityFields = ({
  record,
  includeDetails,
}: {
  record: Record<string, unknown>;
  includeDetails: boolean;
}): TaskEntityFields => {
  const status = readOptionalString(record.status);
  const dueDate = toEpochSeconds(record.dueAt);

  const cardFields: TaskEntityFields = {
    ...(isDefined(status)
      ? { status: { label: 'Status', value: humanizeSelectValue(status) } }
      : {}),
    ...(isDefined(dueDate)
      ? {
          due_date: {
            label: 'Due date',
            type: SLACK_ENTITY_FIELD_TYPE.TIMESTAMP,
            value: dueDate,
          },
        }
      : {}),
  };

  if (!includeDetails) {
    return cardFields;
  }

  const assignee = buildFullName(asRecord(record.assignee)?.name);
  const description = readSlackBodyPreview({
    bodyValue: record.bodyV2,
    maxLength: SLACK_TASK_DESCRIPTION_MAX_LENGTH,
  });
  const dateCreated = toEpochSeconds(record.createdAt);
  const dateUpdated = toEpochSeconds(record.updatedAt);

  return {
    ...cardFields,
    ...(isDefined(assignee)
      ? {
          assignee: {
            label: 'Assignee',
            type: SLACK_ENTITY_FIELD_TYPE.USER,
            user: { text: assignee },
          },
        }
      : {}),
    ...(isDefined(description)
      ? { description: { label: 'Body', value: description, long: true } }
      : {}),
    ...(isDefined(dateCreated)
      ? { date_created: { label: 'Created', value: dateCreated } }
      : {}),
    ...(isDefined(dateUpdated)
      ? { date_updated: { label: 'Updated', value: dateUpdated } }
      : {}),
  };
};
