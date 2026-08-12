import { readSlackRecordProperty } from 'src/logic-functions/utils/read-slack-record-property';
import { readSlackRecordText } from 'src/logic-functions/utils/read-slack-record-text';

export const formatSlackRecordDomain = (value: unknown): string | undefined => {
  const primaryLinkUrl = readSlackRecordText(
    readSlackRecordProperty(value, 'primaryLinkUrl'),
  );

  if (primaryLinkUrl === undefined) {
    return undefined;
  }

  const domain = primaryLinkUrl
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '');

  return domain.length === 0 ? undefined : domain;
};
