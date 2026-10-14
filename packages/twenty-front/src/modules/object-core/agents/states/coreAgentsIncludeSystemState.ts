import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const coreAgentsIncludeSystemState = createAtomState<boolean>({
  key: 'coreAgentsIncludeSystemState',
  defaultValue: false,
});
