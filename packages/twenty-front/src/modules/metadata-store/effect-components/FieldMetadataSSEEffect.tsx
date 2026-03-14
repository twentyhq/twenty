import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const FieldMetadataSSEEffect = () => {
  const queryId = 'field-metadata-sse-effect';

  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      metadataName: AllMetadataName.fieldMetadata,
      variables: {},
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.fieldMetadata,
    onMetadataOperationBrowserEvent: async () => {
      await refreshObjectMetadataItems();
    },
  });

  return null;
};
