import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
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
      const entry = store.get(
        metadataStoreState.atomFamily('fieldMetadataItems'),
      );
      const currentFields = entry.current as FlatFieldMetadataItem[];

      switch (eventDetail.operation.type) {
        case 'create': {
          const createdField = eventDetail.operation
            .createdRecord as unknown as FlatFieldMetadataItem;

          store.set(metadataStoreState.atomFamily('fieldMetadataItems'), {
            ...entry,
            current: [...currentFields, createdField],
          });
          break;
        }
        case 'update': {
          const updatedField = eventDetail.operation
            .updatedRecord as unknown as FlatFieldMetadataItem;

          store.set(metadataStoreState.atomFamily('fieldMetadataItems'), {
            ...entry,
            current: currentFields.map((field) =>
              field.id === updatedField.id
                ? { ...field, ...updatedField }
                : field,
            ),
          });
          break;
        }
        case 'delete': {
          const deletedFieldId = eventDetail.operation
            .deletedRecordId as string;

          store.set(metadataStoreState.atomFamily('fieldMetadataItems'), {
            ...entry,
            current: currentFields.filter(
              (field) => field.id !== deletedFieldId,
            ),
          });
          break;
        }
        default:
          return;
      }
    },
  });

  return null;
};
