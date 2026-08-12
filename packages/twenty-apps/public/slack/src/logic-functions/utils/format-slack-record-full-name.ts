import { isNonEmptyArray } from '@sniptt/guards';

import { readSlackRecordProperty } from 'src/logic-functions/utils/read-slack-record-property';
import { readSlackRecordText } from 'src/logic-functions/utils/read-slack-record-text';

export const formatSlackRecordFullName = (
  value: unknown,
): string | undefined => {
  const nameParts = [
    readSlackRecordText(readSlackRecordProperty(value, 'firstName')),
    readSlackRecordText(readSlackRecordProperty(value, 'lastName')),
  ].filter((namePart): namePart is string => namePart !== undefined);

  return isNonEmptyArray(nameParts) ? nameParts.join(' ') : undefined;
};
