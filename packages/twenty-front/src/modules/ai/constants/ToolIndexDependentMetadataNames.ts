import { type BroadcastEntityName } from '@/browser-event/types/BroadcastEntityName';

// What the server reads to build the role-scoped tool index
export const TOOL_INDEX_DEPENDENT_METADATA_NAMES: BroadcastEntityName[] = [
  'objectMetadata',
  'logicFunction',
  'frontComponent',
  'application',
  'role',
  'roleTarget',
  'objectPermission',
  'permissionFlag',
  'rolePermissionFlag',
];
