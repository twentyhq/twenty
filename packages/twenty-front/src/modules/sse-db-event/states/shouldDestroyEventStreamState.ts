import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const shouldDestroyEventStreamState = createAtomState<boolean>({
  key: 'shouldDestroyEventStreamState',
  defaultValue: false,
});
