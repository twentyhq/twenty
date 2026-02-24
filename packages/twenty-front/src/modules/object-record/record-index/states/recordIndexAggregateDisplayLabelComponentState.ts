import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordIndexAggregateDisplayLabelComponentState =
  createComponentStateV2<string | null>({
    key: 'recordIndexAggregateDisplayLabelForGroupValueComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
