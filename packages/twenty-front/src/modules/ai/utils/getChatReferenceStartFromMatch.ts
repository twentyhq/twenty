import { type ChatReferenceStart } from '@/ai/types/ChatReferenceStart';
import { isDefined } from 'twenty-shared/utils';

const OPEN_BRACKETS_REGEX = /^\[+/;

export const getChatReferenceStartFromMatch = (
  match: RegExpExecArray,
): ChatReferenceStart => {
  const {
    objectNameSingular,
    fieldMetadataItemId,
    viewId,
    recordObjectNameSingular,
    recordId,
  } = match.groups ?? {};

  const openBracketsMatch = OPEN_BRACKETS_REGEX.exec(match[0]);

  const position = {
    index: match.index,
    prefixLength: match[0].length,
    openBracketLength: isDefined(openBracketsMatch)
      ? openBracketsMatch[0].length
      : 0,
  };

  if (isDefined(objectNameSingular)) {
    return { ...position, identity: { kind: 'object', objectNameSingular } };
  }

  if (isDefined(fieldMetadataItemId)) {
    return { ...position, identity: { kind: 'field', fieldMetadataItemId } };
  }

  if (isDefined(viewId)) {
    return { ...position, identity: { kind: 'view', viewId } };
  }

  return {
    ...position,
    identity: {
      kind: 'record',
      objectNameSingular: recordObjectNameSingular,
      recordId,
    },
  };
};
