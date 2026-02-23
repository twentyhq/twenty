import { selectorFamily } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { uncapitalize } from 'twenty-shared/utils';

export const recordStoreIdentifierFamilySelector = selectorFamily({
  key: 'recordStoreIdentifierFamilySelector',
  get:
    ({
      recordId,
      allowRequestsToTwentyIcons,
      isFilesFieldMigrated,
    }: {
      recordId: string;
      allowRequestsToTwentyIcons: boolean;
      isFilesFieldMigrated?: boolean;
    }) =>
    () => {
      const recordFromStore = jotaiStore.get(
        recordStoreFamilyState.atomFamily(recordId),
      );
      const objectNameSingular = uncapitalize(
        recordFromStore?.__typename ?? '',
      );

      const objectMetadataItems = jotaiStore.get(objectMetadataItemsState.atom);

      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === objectNameSingular,
      );

      if (!objectMetadataItem || !recordFromStore) {
        return null;
      }

      return getObjectRecordIdentifier({
        objectMetadataItem: objectMetadataItem,
        record: recordFromStore,
        allowRequestsToTwentyIcons,
        isFilesFieldMigrated,
      });
    },
});
