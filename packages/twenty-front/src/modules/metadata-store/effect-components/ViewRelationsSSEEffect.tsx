import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useGetObjectMetadataItemIdFromViewRelationEventDetail } from '@/metadata-store/hooks/useGetObjectMetadataItemIdFromViewRelationEventDetail';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { type ViewField } from '@/views/types/ViewField';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { type ViewSort } from '@/views/types/ViewSort';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const ViewRelationsSSEEffect = () => {
  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const { getObjectMetadataItemIdFromViewRelationEventDetail } =
    useGetObjectMetadataItemIdFromViewRelationEventDetail();

  useListenToEventsForQuery({
    queryId: 'view-filters-sse-effect',
    operationSignature: {
      metadataName: AllMetadataName.viewFilter,
      variables: {},
    },
  });

  useListenToEventsForQuery({
    queryId: 'view-sorts-sse-effect',
    operationSignature: {
      metadataName: AllMetadataName.viewSort,
      variables: {},
    },
  });

  useListenToEventsForQuery({
    queryId: 'view-fields-sse-effect',
    operationSignature: {
      metadataName: AllMetadataName.viewField,
      variables: {},
    },
  });

  useListenToEventsForQuery({
    queryId: 'view-filter-groups-sse-effect',
    operationSignature: {
      metadataName: AllMetadataName.viewFilterGroup,
      variables: {},
    },
  });

  // TODO: replace this with detailed SSE optimistic effects
  const debouncedRefreshCoreViewsByObjectMetadataId = useDebouncedCallback(
    (objectMetadataId: string) => {
      refreshCoreViewsByObjectMetadataId(objectMetadataId);
    },
    500,
    {
      leading: false,
      trailing: true,
    },
  );

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.viewFilter,
    onMetadataOperationBrowserEvent: (
      detail: MetadataOperationBrowserEventDetail<ViewFilter>,
    ) => {
      const objectMetadataItemId =
        getObjectMetadataItemIdFromViewRelationEventDetail(detail);

      if (!isDefined(objectMetadataItemId)) {
        return;
      }

      debouncedRefreshCoreViewsByObjectMetadataId(objectMetadataItemId);
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.viewSort,
    onMetadataOperationBrowserEvent: (
      detail: MetadataOperationBrowserEventDetail<ViewSort>,
    ) => {
      const objectMetadataItemId =
        getObjectMetadataItemIdFromViewRelationEventDetail(detail);

      if (!isDefined(objectMetadataItemId)) {
        return;
      }

      debouncedRefreshCoreViewsByObjectMetadataId(objectMetadataItemId);
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.viewFilterGroup,
    onMetadataOperationBrowserEvent: (
      detail: MetadataOperationBrowserEventDetail<ViewFilterGroup>,
    ) => {
      const objectMetadataItemId =
        getObjectMetadataItemIdFromViewRelationEventDetail(detail);

      if (!isDefined(objectMetadataItemId)) {
        return;
      }

      debouncedRefreshCoreViewsByObjectMetadataId(objectMetadataItemId);
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.viewField,
    onMetadataOperationBrowserEvent: (
      detail: MetadataOperationBrowserEventDetail<ViewField>,
    ) => {
      const objectMetadataItemId =
        getObjectMetadataItemIdFromViewRelationEventDetail(detail);

      if (!isDefined(objectMetadataItemId)) {
        return;
      }

      debouncedRefreshCoreViewsByObjectMetadataId(objectMetadataItemId);
    },
  });

  return null;
};
