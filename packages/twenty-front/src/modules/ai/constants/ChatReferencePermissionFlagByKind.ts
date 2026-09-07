import { type ChatReferenceKind } from '@/ai/types/ChatReferenceKind';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const CHAT_REFERENCE_PERMISSION_FLAG_BY_KIND: Partial<
  Record<ChatReferenceKind, PermissionFlagType>
> = {
  object: PermissionFlagType.DATA_MODEL,
  field: PermissionFlagType.DATA_MODEL,
  role: PermissionFlagType.ROLES,
  app: PermissionFlagType.APPLICATIONS,
};
