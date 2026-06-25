import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'src/utils/is-defined';

import { type FirefliesTranscript } from 'src/logic-functions/types/fireflies-transcript.type';

const EMPTY_SUMMARY_MESSAGE =
  '_Fireflies returned no summary content for this meeting._';

export const formatSummaryAsMarkdown = (
  transcript: FirefliesTranscript,
): string => {
  const summary = transcript.summary;

  if (!isDefined(summary)) {
    return EMPTY_SUMMARY_MESSAGE;
  }

  const sections: string[] = [];

  if (isNonEmptyString(summary.overview?.trim())) {
    sections.push(`## Overview\n\n${summary.overview.trim()}`);
  }

  if (isNonEmptyString(summary.action_items?.trim())) {
    sections.push(`## Action items\n\n${summary.action_items.trim()}`);
  }

  if (isNonEmptyArray(summary.topics_discussed)) {
    sections.push(
      `## Topics discussed\n\n${summary.topics_discussed.join(', ')}`,
    );
  }

  if (isNonEmptyArray(summary.keywords)) {
    sections.push(`## Keywords\n\n${summary.keywords.join(', ')}`);
  }

  if (sections.length === 0) {
    return EMPTY_SUMMARY_MESSAGE;
  }

  return sections.join('\n\n');
};
