import { type ViewType } from '@/views/types/ViewType';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordIndexViewTypeState = createAtomComponentState<
  ViewType | undefined
>({
  key: 'recordIndexViewTypeState',
  defaultValue: undefined,
  componentInstanceContext: ViewComponentInstanceContext,
});
