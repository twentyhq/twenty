import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { createFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createFamilySelectorV2';
import { isDefined, uncapitalize } from 'twenty-shared/utils';

export const recordStoreIdentifiersFamilySelector = createFamilySelectorV2<
  ObjectRecordIdentifier[],
  {
    recordIds: string[];
    allowRequestsToTwentyIcons: boolean;
  }
>({
  key: 'recordStoreIdentifiersFamilySelector',
  get:
    ({ recordIds, allowRequestsToTwentyIcons }) =>
    ({ get }) => {
      const objectMetadataItems = get(objectMetadataItemsState);

      return recordIds
        .map((recordId) => {
          const recordFromStore = get(recordStoreFamilyState, recordId);
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
            allowRequestsToTwentyIcons,
          });
        })
        .filter(isDefined);
    },
});
