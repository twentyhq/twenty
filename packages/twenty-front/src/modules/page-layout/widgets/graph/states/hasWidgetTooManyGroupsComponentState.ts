import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const hasWidgetTooManyGroupsComponentState =
  createAtomComponentState<boolean>({
    key: 'hasWidgetTooManyGroupsComponentState',
    defaultValue: false,
    componentInstanceContext: WidgetComponentInstanceContext,
  });
