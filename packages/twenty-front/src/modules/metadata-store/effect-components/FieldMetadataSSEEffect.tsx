import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { patchMetadataStoreFromSSEEvent } from '@/metadata-store/utils/patchMetadataStoreFromSSEEvent';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useStore } from 'jotai';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const FieldMetadataSSEEffect = () => {
  const queryId = 'field-metadata-sse-effect';

  const store = useStore();

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      metadataName: AllMetadataName.fieldMetadata,
      variables: {},
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.fieldMetadata,
    onMetadataOperationBrowserEvent: (eventDetail) => {
      patchMetadataStoreFromSSEEvent(
        store,
        'fieldMetadataItems',
        eventDetail.operation,
      );
    },
  });

  return null;
};
