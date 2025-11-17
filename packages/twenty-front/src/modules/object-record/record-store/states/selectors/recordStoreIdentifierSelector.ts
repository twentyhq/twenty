import { selectorFamily } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { mergePreviewRecordFamilyState } from '@/object-record/record-merge/states/mergePreviewRecordFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDefined, uncapitalize } from 'twenty-shared/utils';

export const recordStoreIdentifierFamilySelector = selectorFamily({
  key: 'recordStoreIdentifierFamilySelector',
  get:
    ({ recordId }: { recordId: string }) =>
    ({ get }) => {
      const previewRecord = get(mergePreviewRecordFamilyState(recordId));
      const recordFromStore = isDefined(previewRecord)
        ? previewRecord
        : get(recordStoreFamilyState(recordId));
      const objectNameSingular = uncapitalize(
        recordFromStore?.__typename ?? '',
      );

      const objectMetadataItems = get(objectMetadataItemsState);

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
    },
});
