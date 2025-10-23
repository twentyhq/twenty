import { selectorFamily } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDefined, uncapitalize } from 'twenty-shared/utils';

export const recordStoreIdentifiersFamilySelector = selectorFamily({
  key: 'recordStoreIdentifiersFamilySelector',
  get:
    ({ recordIds }: { recordIds: string[] }) =>
    ({ get }) => {
      const objectMetadataItems = get(objectMetadataItemsState);

      return recordIds
        .map((recordId) => {
          const recordFromStore = get(recordStoreFamilyState(recordId));
          const objectNameSingular = uncapitalize(
            recordFromStore?.__typename ?? '',
          );

          const objectMetadataItem = objectMetadataItems.find(
            (item) => item.nameSingular === objectNameSingular,
          );

          if (!objectMetadataItem || !recordFromStore) {
            return null;
          }

          return getObjectRecordIdentifier({
            objectMetadataItem: objectMetadataItem,
            record: recordFromStore,
          });
        })
        .filter(isDefined);
    },
});
