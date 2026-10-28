import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const recordIndexRecordCountForGroupValueComponentFamilyState =
  createAtomComponentFamilyState<number | null, { groupValue: string }>({
    key: 'recordIndexRecordCountForGroupValueComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
