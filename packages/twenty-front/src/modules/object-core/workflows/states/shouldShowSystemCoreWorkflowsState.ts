import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const shouldShowSystemCoreWorkflowsState = createAtomState<boolean>({
  key: 'shouldShowSystemCoreWorkflowsState',
  defaultValue: false,
});
