import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const coreViewsState = createAtomState<CoreViewWithRelations[]>({
  key: 'coreViewsState',
  defaultValue: [],
});
