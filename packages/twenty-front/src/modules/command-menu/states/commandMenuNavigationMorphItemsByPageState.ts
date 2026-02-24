import { type MorphItem } from '@/object-record/multiple-objects/types/MorphItem';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const commandMenuNavigationMorphItemsByPageState = createStateV2<
  Map<string, MorphItem[]>
>({
  key: 'command-menu/commandMenuNavigationMorphItemsByPageState',
  defaultValue: new Map(),
});
