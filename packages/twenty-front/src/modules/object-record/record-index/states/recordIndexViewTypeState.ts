import { type ViewType } from '@/views/types/ViewType';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexViewTypeState = createAtomState<ViewType | undefined>({
  key: 'recordIndexViewTypeState',
  defaultValue: undefined,
});
