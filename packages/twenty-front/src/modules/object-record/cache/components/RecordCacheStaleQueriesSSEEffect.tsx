import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { isObjectMetadataFieldRename } from '@/browser-event/utils/isObjectMetadataFieldRename';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const RecordCacheStaleQueriesSSEEffect = () => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();

  useListenToMetadataOperationBrowserEvent<FlatFieldMetadataItem>({
    metadataName: AllMetadataName.fieldMetadata,
    onMetadataOperationBrowserEvent: ({ operation }) => {
      if (
        !isObjectMetadataFieldRename(operation) &&
        operation.type !== 'delete'
      ) {
        return;
      }

      const fieldMetadataItem =
        operation.type === 'delete'
          ? operation.deletedRecord
          : operation.updatedRecord;

      if (!isDefined(fieldMetadataItem)) {
        return;
      }

      const objectMetadataItem = store
        .get(objectMetadataItemsSelector.atom)
        .find((item) => item.id === fieldMetadataItem.objectMetadataId);

      if (!isDefined(objectMetadataItem)) {
        return;
      }

      for (const fieldName of [
        objectMetadataItem.namePlural,
        `${objectMetadataItem.namePlural}GroupBy`,
      ]) {
        apolloCoreClient.cache.evict({
          id: 'ROOT_QUERY',
          fieldName,
          broadcast: false,
        });
      }
    },
  });

  return null;
};
