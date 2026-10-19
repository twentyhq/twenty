import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const shouldShowSystemCoreAgentsState = createAtomState<boolean>({
  key: 'shouldShowSystemCoreAgentsState',
  defaultValue: false,
});
