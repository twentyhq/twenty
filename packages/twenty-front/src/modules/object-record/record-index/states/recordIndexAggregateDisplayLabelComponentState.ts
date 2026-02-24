import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const recordIndexAggregateDisplayLabelComponentState =
  createComponentState<string | null>({
    key: 'recordIndexAggregateDisplayLabelForGroupValueComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
