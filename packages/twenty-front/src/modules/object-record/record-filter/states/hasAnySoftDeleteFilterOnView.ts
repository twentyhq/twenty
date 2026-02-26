import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isRecordFilterAboutSoftDelete } from '@/object-record/record-filter/utils/isRecordFilterAboutSoftDelete';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const hasAnySoftDeleteFilterOnViewComponentSelector =
  createAtomComponentSelector<boolean>({
    key: 'hasAnySoftDeleteFilterOnViewComponentSelector',
    componentInstanceContext: RecordFiltersComponentInstanceContext,
    get:
      (componentStateKey) =>
      ({ get }) => {
        const objectMetadataItems = get(objectMetadataItemsState);
        const currentRecordFilters = get(
          currentRecordFiltersComponentState,
          componentStateKey,
        ) as RecordFilter[];

        const hasAnySoftDeleteFilterOnView = currentRecordFilters.some(
          (recordFilter) => {
            return isRecordFilterAboutSoftDelete({
              recordFilter,
              objectMetadataItems,
            });
          },
        );
        return hasAnySoftDeleteFilterOnView;
      },
  });
