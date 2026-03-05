import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';

export const coreViewsState = createAtomState<CoreViewWithRelations[]>({
  key: 'coreViewsState',
  defaultValue: [],
});
