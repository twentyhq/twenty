import { type ChatReferenceIdentity } from '@/ai/types/ChatReferenceIdentity';
import { assertUnreachable } from 'twenty-shared/utils';

export const getChatReferenceIdentitySegment = (
  identity: ChatReferenceIdentity,
): string => {
  switch (identity.kind) {
    case 'record':
      return `${identity.objectNameSingular}:${identity.recordId}`;
    case 'object':
      return identity.objectNameSingular;
    case 'field':
      return identity.fieldMetadataItemId;
    case 'view':
      return identity.viewId;
    default:
      return assertUnreachable(identity);
  }
};
