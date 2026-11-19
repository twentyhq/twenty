import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const processedWorkspaceSetupCompletionIdsState = createAtomState<
  string[]
>({
  key: 'processedWorkspaceSetupCompletionIdsState',
  defaultValue: [],
});
