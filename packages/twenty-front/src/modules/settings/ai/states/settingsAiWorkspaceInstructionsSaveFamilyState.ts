import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const settingsAiWorkspaceInstructionsSaveFamilyState =
  createAtomFamilyState<
    {
      latestRequestId: number;
      pendingRequestCount: number;
      pendingSave: Promise<void> | null;
    },
    string
  >({
    key: 'settingsAiWorkspaceInstructionsSaveFamilyState',
    defaultValue: {
      latestRequestId: 0,
      pendingRequestCount: 0,
      pendingSave: null,
    },
  });
