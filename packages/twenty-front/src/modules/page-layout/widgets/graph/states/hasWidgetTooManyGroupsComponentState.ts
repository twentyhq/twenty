import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const hasWidgetTooManyGroupsComponentState =
  createComponentStateV2<boolean>({
    key: 'hasWidgetTooManyGroupsComponentState',
    defaultValue: false,
    componentInstanceContext: WidgetComponentInstanceContext,
  });
