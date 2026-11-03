import { AI_OBJECT_ROW_ACCESS_POLICIES } from 'src/engine/metadata-modules/ai/constants/ai-object-row-access-policies.constant';
import { type ObjectRowAccessPolicy } from 'src/engine/permissions/row-policy/types/object-row-access-policy.type';

export const ENGINE_OBJECT_ROW_ACCESS_POLICIES: ObjectRowAccessPolicy[] = [
  ...AI_OBJECT_ROW_ACCESS_POLICIES,
];
