import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import {
  getRecordGroupVisibilityFilters,
  type RecordGroupVisibilityFilters,
} from '@/views/utils/getRecordGroupVisibilityFilters';

export const useGetRecordGroupVisibilityFilters =
  (): RecordGroupVisibilityFilters => {
    const { currentView } = useGetCurrentViewOnly();
    const flattenedFieldMetadataItems = useAtomStateValue(
      flattenedFieldMetadataItemsSelector,
    );

    return getRecordGroupVisibilityFilters({
      view: currentView,
      fieldMetadataItems: flattenedFieldMetadataItems,
    });
  };
