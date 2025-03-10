import { MorphItem } from '@/object-record/multiple-objects/types/MorphItem';
import { createState } from '@ui/utilities/state/utils/createState';

export const commandMenuNavigationMorphItemsState = createState<
  Map<string, MorphItem>
>({
  key: 'command-menu/commandMenuNavigationMorphItemsState',
  defaultValue: new Map(),
});
