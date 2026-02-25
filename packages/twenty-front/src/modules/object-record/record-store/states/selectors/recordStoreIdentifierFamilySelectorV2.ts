import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { uncapitalize } from 'twenty-shared/utils';

type RecordStoreIdentifierFamilyKey = {
  recordId: string;
  allowRequestsToTwentyIcons: boolean;
  isFilesFieldMigrated?: boolean;
};

export const recordStoreIdentifierFamilySelectorV2 = createAtomFamilySelector<
  ObjectRecordIdentifier | null,
  RecordStoreIdentifierFamilyKey
>({
  key: 'recordStoreIdentifierFamilySelectorV2',
  get:
    ({
      recordId,
      allowRequestsToTwentyIcons,
      isFilesFieldMigrated,
    }: RecordStoreIdentifierFamilyKey) =>
    ({ get }) => {
      const recordFromStore = get(recordStoreFamilyState, recordId);
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
        allowRequestsToTwentyIcons,
        isFilesFieldMigrated,
      });
    },
});
