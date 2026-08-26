import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { isDefined } from 'twenty-shared/utils';

export const getChatReferenceMatchFromRegexMatch = (
  match: RegExpExecArray,
): ChatReferenceMatch => {
  const {
    objectNameSingular,
    objectLabel,
    fieldObjectNameSingular,
    fieldName,
    fieldLabel,
    legacyFieldMetadataItemId,
    legacyFieldLabel,
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

  if (isDefined(fieldObjectNameSingular)) {
    return {
      ...position,
      kind: 'field',
      objectNameSingular: fieldObjectNameSingular,
      fieldName,
      displayName: fieldLabel,
    };
  }

  if (isDefined(legacyFieldMetadataItemId)) {
    return {
      ...position,
      kind: 'legacyFieldById',
      fieldMetadataItemId: legacyFieldMetadataItemId,
      displayName: legacyFieldLabel,
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
