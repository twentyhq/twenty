import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const coreViewsState = createState<CoreViewWithRelations[]>({
  key: 'coreViewsState',
  defaultValue: [],
});
