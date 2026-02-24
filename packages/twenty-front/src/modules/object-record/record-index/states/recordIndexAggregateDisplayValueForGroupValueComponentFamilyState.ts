import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';

export const recordIndexAggregateDisplayValueForGroupValueComponentFamilyState =
  createComponentFamilyStateV2<string | null, { groupValue: string }>({
    key: 'recordIndexAggregateDisplayValueForGroupValueComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
