import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const recordIndexAggregateDisplayValueForGroupValueComponentFamilyState =
  createAtomComponentFamilyState<string | null, { groupValue: string }>({
    key: 'recordIndexAggregateDisplayValueForGroupValueComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
