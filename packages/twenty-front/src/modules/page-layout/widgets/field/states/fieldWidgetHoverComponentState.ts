import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const fieldWidgetHoverComponentState = createAtomComponentState<boolean>(
  {
    key: 'fieldWidgetHoverComponentState',
    defaultValue: false,
    componentInstanceContext: WidgetComponentInstanceContext,
  },
);
