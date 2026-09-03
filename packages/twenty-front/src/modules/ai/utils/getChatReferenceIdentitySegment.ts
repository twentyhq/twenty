import { type ChatReferenceIdentity } from '@/ai/types/ChatReferenceIdentity';
import { assertUnreachable } from 'twenty-shared/utils';

export const getChatReferenceIdentitySegment = (
  identity: ChatReferenceIdentity,
): string => {
  switch (identity.kind) {
    case 'record':
      return `${identity.objectNameSingular}:${identity.recordId}`;
    case 'records':
      return identity.objectMetadataId;
    case 'object':
      return identity.objectNameSingular;
    case 'field':
      return `${identity.objectNameSingular}:${identity.fieldName}`;
    case 'view':
      return identity.viewId;
    case 'role':
      return identity.roleId;
    case 'app':
      return identity.applicationId;
    default:
      return assertUnreachable(identity);
  }
};
