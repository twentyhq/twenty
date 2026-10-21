import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const commandMenuItemVisibilityEditItemIdState = createAtomState<
  string | null
>({
  key: 'commandMenuItemVisibilityEditItemIdState',
  defaultValue: null,
});
