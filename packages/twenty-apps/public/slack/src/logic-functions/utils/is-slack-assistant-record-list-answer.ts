import { isNonEmptyString } from '@sniptt/guards';

import { buildSlackRecordUrlPatternSource } from 'src/logic-functions/utils/build-slack-record-url-pattern-source';

const LIST_ITEM_PREFIX_PATTERN = /^\s*(?:[-*+]|\d+[.)])\s+/;
const LEADING_EMPHASIS_PATTERN = /^(?:\*\*|__|\*|_)+/;
const MINIMUM_LISTED_RECORDS = 2;

// A reply about one record still links the records around it: its company, its
// owner, the deal it belongs to. What marks a many-record answer is the shape
// the prompt asks for, one bullet per record, with the record opening the line.
export const isSlackAssistantRecordListAnswer = ({
  answerText,
  workspaceBaseUrl,
}: {
  answerText: string;
  workspaceBaseUrl: string | undefined;
}): boolean => {
  if (!isNonEmptyString(workspaceBaseUrl)) {
    return false;
  }

  const listedRecordLinkPattern = new RegExp(
    `^\\[[^\\]\\n]*\\]\\(${buildSlackRecordUrlPatternSource(workspaceBaseUrl)}`,
    'i',
  );

  const listedRecordIds = new Set<string>();

  for (const line of answerText.split('\n')) {
    if (!LIST_ITEM_PREFIX_PATTERN.test(line)) {
      continue;
    }

    const listItemText = line
      .replace(LIST_ITEM_PREFIX_PATTERN, '')
      .replace(LEADING_EMPHASIS_PATTERN, '');

    const listedRecordMatch = listedRecordLinkPattern.exec(listItemText);

    if (listedRecordMatch !== null) {
      listedRecordIds.add(listedRecordMatch[2].toLowerCase());
    }
  }

  return listedRecordIds.size >= MINIMUM_LISTED_RECORDS;
};
