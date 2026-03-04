import { type MorphItem } from '@/object-record/multiple-objects/types/MorphItem';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sidePanelNavigationMorphItemsByPageState = createAtomState<
  Map<string, MorphItem[]>
>({
  key: 'command-menu/sidePanelNavigationMorphItemsByPageState',
  defaultValue: new Map(),
});
