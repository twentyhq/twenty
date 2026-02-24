import { type ViewType } from '@/views/types/ViewType';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const recordIndexViewTypeState = createStateV2<ViewType | undefined>({
  key: 'recordIndexViewTypeState',
  defaultValue: undefined,
});
