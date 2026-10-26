import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type RecordPermissionPolicyDefinition } from 'twenty-shared/types';

export const recordPermissionPolicyDraftState = createAtomState<{
  workspaceId: string;
  expectedActiveRevisionId: string | null;
  definition: RecordPermissionPolicyDefinition;
} | null>({
  key: 'recordPermissionPolicyDraftState',
  defaultValue: null,
  scope: 'routed-flow',
});
