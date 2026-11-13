import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const inboxSelectedFilesState = createAtomState<File[]>({
  key: 'ai/inboxSelectedFilesState',
  defaultValue: [],
});
