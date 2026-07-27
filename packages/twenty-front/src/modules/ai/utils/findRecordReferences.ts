import { RECORD_REFERENCE_CLOSE_TAG } from '@/ai/constants/RecordReferenceCloseTag';
import { type RecordReferenceMatch } from '@/ai/types/RecordReferenceMatch';

const RECORD_REFERENCE_START_REGEX =
  /\[\[(?:record:)?([a-zA-Z]+):([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}):/g;

export const findRecordReferences = (text: string): RecordReferenceMatch[] => {
  const starts: Array<{
    index: number;
    prefixLength: number;
    objectNameSingular: string;
    recordId: string;
  }> = [];

  RECORD_REFERENCE_START_REGEX.lastIndex = 0;

  let startMatch;

  while ((startMatch = RECORD_REFERENCE_START_REGEX.exec(text)) !== null) {
    starts.push({
      index: startMatch.index,
      prefixLength: startMatch[0].length,
      objectNameSingular: startMatch[1],
      recordId: startMatch[2],
    });
  }

  return starts.flatMap((start, startIndex) => {
    const displayNameStart = start.index + start.prefixLength;
    const windowEnd =
      startIndex + 1 < starts.length
        ? starts[startIndex + 1].index
        : text.length;
    const window = text.slice(displayNameStart, windowEnd);

    const closeTagIndexInWindow = window.indexOf(RECORD_REFERENCE_CLOSE_TAG);

    const closingIndexInWindow =
      closeTagIndexInWindow !== -1
        ? closeTagIndexInWindow
        : window.lastIndexOf(']]');

    if (closingIndexInWindow === -1) {
      return [];
    }

    const closeLength =
      closeTagIndexInWindow !== -1 ? RECORD_REFERENCE_CLOSE_TAG.length : 2;
    const displayName = window.slice(0, closingIndexInWindow);
    const fullMatchEnd = displayNameStart + closingIndexInWindow + closeLength;

    return [
      {
        fullMatch: text.slice(start.index, fullMatchEnd),
        index: start.index,
        objectNameSingular: start.objectNameSingular,
        recordId: start.recordId,
        displayName,
      },
    ];
  });
};
