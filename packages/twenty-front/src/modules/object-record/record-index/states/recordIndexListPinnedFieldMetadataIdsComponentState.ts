import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexListPinnedFieldMetadataIdsComponentState =
  createAtomComponentState<string[]>({
    key: 'recordIndexListPinnedFieldMetadataIdsComponentState',
    defaultValue: [],
    componentInstanceContext: ViewComponentInstanceContext,
  });
