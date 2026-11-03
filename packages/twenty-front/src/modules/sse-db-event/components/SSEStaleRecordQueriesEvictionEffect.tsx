import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getObjectMetadataIdWithStaleFieldName } from '@/sse-db-event/utils/getObjectMetadataIdWithStaleFieldName';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const SSEStaleRecordQueriesEvictionEffect = () => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.fieldMetadata,
    onMetadataOperationBrowserEvent: ({ operation }) => {
      const objectMetadataId = getObjectMetadataIdWithStaleFieldName(operation);

      if (!isDefined(objectMetadataId)) {
        return;
      }

      const objectMetadataItem = store
        .get(objectMetadataItemsSelector.atom)
        .find((item) => item.id === objectMetadataId);

      if (!isDefined(objectMetadataItem)) {
        return;
      }

      apolloCoreClient.cache.evict({
        id: 'ROOT_QUERY',
        fieldName: objectMetadataItem.namePlural,
        broadcast: false,
      });
    },
  });

  return null;
};
