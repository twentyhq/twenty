import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const isRecordIndexLoadMoreLockedComponentState =
  createComponentStateV2<boolean>({
    key: 'isRecordIndexLoadMoreLockedComponentState',
    componentInstanceContext: ViewComponentInstanceContext,
    defaultValue: false,
  });
