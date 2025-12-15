import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const recordIndexAggregateDisplayValueForGroupValueComponentFamilyState =
  createComponentFamilyState<string | null, { groupValue: string }>({
    key: 'recordIndexAggregateDisplayValueForGroupValueComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
