import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useGetViewIdFromViewSSERelationEventDetail } from '@/metadata-store/hooks/useGetViewIdFromViewSSERelationEventDetail';
import { useGetViewById } from '@/views/hooks/useGetViewById';
import { type ViewField } from '@/views/types/ViewField';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { type ViewSort } from '@/views/types/ViewSort';
import { isDefined } from 'twenty-shared/utils';

export const useGetObjectMetadataItemIdFromViewRelationEventDetail = () => {
  const { getViewIdFromViewSSERelationEventDetail } =
    useGetViewIdFromViewSSERelationEventDetail();

  const { getViewById } = useGetViewById();

  const getObjectMetadataItemIdFromViewRelationEventDetail = <
    T extends ViewFilter | ViewFilterGroup | ViewField | ViewSort,
  >(
    eventDetail: MetadataOperationBrowserEventDetail<T>,
  ) => {
    const viewId = getViewIdFromViewSSERelationEventDetail(eventDetail);

    if (!isDefined(viewId)) {
      return null;
    }

    const { view } = getViewById(viewId);

    if (!isDefined(view)) {
      return null;
    }

    return view.objectMetadataId;
  };

  return {
    getObjectMetadataItemIdFromViewRelationEventDetail,
  };
};
