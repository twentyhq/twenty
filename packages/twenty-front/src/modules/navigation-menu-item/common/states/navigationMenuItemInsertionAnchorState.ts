import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const navigationMenuItemInsertionAnchorState = createAtomState<{
  dropdownId: string;
  element: HTMLElement;
} | null>({
  key: 'navigationMenuItemInsertionAnchorState',
  defaultValue: null,
});
