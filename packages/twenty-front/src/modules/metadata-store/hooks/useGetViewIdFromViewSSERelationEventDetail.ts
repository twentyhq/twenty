import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { coreViewsState } from '@/views/states/coreViewState';
import { type ViewField } from '@/views/types/ViewField';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { type ViewSort } from '@/views/types/ViewSort';
import { type Nullable } from 'twenty-shared/types';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const useGetViewIdFromViewSSERelationEventDetail = () => {
  const coreViews = useAtomStateValue(coreViewsState);

  const getViewIdFromViewSSERelationEventDetail = <
    T extends ViewFilter | ViewFilterGroup | ViewField | ViewSort,
  >(
    eventDetail: MetadataOperationBrowserEventDetail<T>,
  ) => {
    switch (eventDetail.operation.type) {
      case 'create': {
        return eventDetail.operation.createdRecord?.viewId as Nullable<string>;
      }
      case 'update': {
        return eventDetail.operation.updatedRecord?.viewId as Nullable<string>;
      }
      case 'delete': {
        const deletedRecordId = eventDetail.operation.deletedRecordId;

        switch (eventDetail.metadataName) {
          case AllMetadataName.viewFilter:
            return coreViews.find((view) =>
              view.viewFilters.some(
                (viewFilter) => viewFilter.id === deletedRecordId,
              ),
            )?.id;
          case AllMetadataName.viewField:
            return coreViews.find((view) =>
              view.viewFields.some(
                (viewField) => viewField.id === deletedRecordId,
              ),
            )?.id;
          case AllMetadataName.viewFilterGroup:
            return coreViews.find((view) =>
              view.viewFilterGroups?.some(
                (viewFilterGroup) => viewFilterGroup.id === deletedRecordId,
              ),
            )?.id;
          case AllMetadataName.viewSort:
            return coreViews.find((view) =>
              view.viewSorts.some(
                (viewSort) => viewSort.id === deletedRecordId,
              ),
            )?.id;
          default:
            return null;
        }
      }
    }
  };

  return {
    getViewIdFromViewSSERelationEventDetail,
  };
};
