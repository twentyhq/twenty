import { readSlackRecordText } from 'src/logic-functions/utils/read-slack-record-text';

// Field values reach Slack as API names such as NEW_LEAD, which the assistant
// must never show to members.
export const formatSlackRecordEnumLabel = (
  value: unknown,
): string | undefined => {
  const enumValue = readSlackRecordText(value);

  if (enumValue === undefined) {
    return undefined;
  }

  const words = enumValue.replace(/_/g, ' ').trim().toLowerCase();

  return words.length === 0
    ? undefined
    : `${words.charAt(0).toUpperCase()}${words.slice(1)}`;
};
