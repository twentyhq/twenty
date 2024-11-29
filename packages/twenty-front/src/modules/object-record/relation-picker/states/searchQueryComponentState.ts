import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { SearchQuery } from '@/object-record/relation-picker/types/SearchQuery';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const searchQueryComponentState =
  createComponentStateV2<SearchQuery | null>({
    key: 'searchQueryComponentState',
    defaultValue: null,
    componentInstanceContext: RecordPickerComponentInstanceContext,
  });
