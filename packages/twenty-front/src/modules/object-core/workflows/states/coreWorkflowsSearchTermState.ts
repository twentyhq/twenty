import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const coreWorkflowsSearchTermState = createAtomState<string>({
  key: 'coreWorkflowsSearchTermState',
  defaultValue: '',
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
