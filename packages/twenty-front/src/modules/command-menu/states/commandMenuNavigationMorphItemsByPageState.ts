import { type MorphItem } from '@/object-record/multiple-objects/types/MorphItem';
import { createState } from '@/ui/utilities/state/utils/createState';

export const commandMenuNavigationMorphItemsByPageState = createState<
  Map<string, MorphItem[]>
>({
  key: 'command-menu/commandMenuNavigationMorphItemsByPageState',
  defaultValue: new Map(),
});
