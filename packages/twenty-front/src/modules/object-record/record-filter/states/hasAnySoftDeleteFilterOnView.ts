import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { isRecordFilterAboutSoftDelete } from '@/object-record/record-filter/utils/isRecordFilterAboutSoftDelete';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';

export const hasAnySoftDeleteFilterOnViewComponentSelector =
  createComponentSelector<boolean>({
    key: 'hasAnySoftDeleteFilterOnViewComponentSelector',
    componentInstanceContext: RecordFiltersComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const objectMetadataItems = get(objectMetadataItemsState);
        const currentRecordFilters = get(
          currentRecordFiltersComponentState.atomFamily({ instanceId }),
        );

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
