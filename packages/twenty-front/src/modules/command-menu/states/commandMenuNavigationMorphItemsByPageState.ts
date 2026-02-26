import { type MorphItem } from '@/object-record/multiple-objects/types/MorphItem';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const commandMenuNavigationMorphItemsByPageState = createAtomState<
  Map<string, MorphItem[]>
>({
  key: 'command-menu/commandMenuNavigationMorphItemsByPageState',
  defaultValue: new Map(),
});
