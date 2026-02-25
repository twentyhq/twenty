import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isCreatingSseEventStreamState = createAtomState<boolean>({
  key: 'isCreatingSseEventStreamState',
  defaultValue: false,
});
