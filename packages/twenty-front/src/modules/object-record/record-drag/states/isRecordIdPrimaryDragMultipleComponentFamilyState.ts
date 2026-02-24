import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createComponentFamilyState';

export const isRecordIdPrimaryDragMultipleComponentFamilyState =
  createComponentFamilyState<boolean, { recordId: string }>({
    key: 'isRecordIdPrimaryDragMultipleComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
