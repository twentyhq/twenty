import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const coreWorkflowsIncludeSystemState = createAtomState<boolean>({
  key: 'coreWorkflowsIncludeSystemState',
  defaultValue: false,
});
