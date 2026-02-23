import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const coreViewsState = createStateV2<CoreViewWithRelations[]>({
  key: 'coreViewsState',
  defaultValue: [],
});
