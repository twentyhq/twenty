import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { isDefined } from 'twenty-shared/utils';

export const getChatReferenceMatchFromRegexMatch = (
  match: RegExpExecArray,
): ChatReferenceMatch => {
  const {
    objectNameSingular,
    objectLabel,
    fieldMetadataItemId,
    fieldLabel,
    viewId,
    viewLabel,
    recordObjectNameSingular,
    recordId,
    recordLabel,
  } = match.groups ?? {};

  const position = { fullMatch: match[0], index: match.index };

  if (isDefined(objectNameSingular)) {
    return {
      ...position,
      kind: 'object',
      objectNameSingular,
      displayName: objectLabel,
    };
  }

  if (isDefined(fieldMetadataItemId)) {
    return {
      ...position,
      kind: 'field',
      fieldMetadataItemId,
      displayName: fieldLabel,
    };
  }

  if (isDefined(viewId)) {
    return {
      ...position,
      kind: 'view',
      viewId,
      displayName: viewLabel,
    };
  }

  return {
    ...position,
    kind: 'record',
    objectNameSingular: recordObjectNameSingular,
    recordId,
    displayName: recordLabel,
  };
};
