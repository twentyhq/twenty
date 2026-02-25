import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const isRecordIdPrimaryDragMultipleComponentFamilyState =
  createAtomComponentFamilyState<boolean, { recordId: string }>({
    key: 'isRecordIdPrimaryDragMultipleComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
