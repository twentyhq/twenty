import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useStore } from 'jotai';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const FieldMetadataSSEEffect = () => {
  const queryId = 'field-metadata-sse-effect';

  const store = useStore();

  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();
  const { updateDraft, applyChanges } = useMetadataStore();

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

      const loadedObjects = store.get(objectMetadataItemsState.atom);
      updateDraft('objectMetadataItems', loadedObjects);
      applyChanges();
    },
  });

  return null;
};
