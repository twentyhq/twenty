import { type ChatReferenceStart } from '@/ai/types/ChatReferenceStart';
import { isDefined } from 'twenty-shared/utils';

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

  const position = { index: match.index, prefixLength: match[0].length };

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
