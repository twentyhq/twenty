import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isDestroyingEventStreamState = createAtomState<boolean>({
  key: 'isDestroyingEventStreamState',
  defaultValue: false,
});
