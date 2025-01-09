import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexEntityCountNoGroupComponentFamilyState =
  createComponentStateV2<number | undefined>({
    key: 'recordIndexEntityCountNoGroupComponentFamilyState',
    defaultValue: undefined,
    componentInstanceContext: ViewComponentInstanceContext,
  });
