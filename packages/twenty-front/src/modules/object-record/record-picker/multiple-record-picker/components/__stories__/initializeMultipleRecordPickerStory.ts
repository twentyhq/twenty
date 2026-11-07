import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

export const initializeMultipleRecordPickerStory = (
  componentInstanceId: string,
) => {
  const companyMetadata = getMockObjectMetadataItemOrThrow('company');
  const personMetadata = getMockObjectMetadataItemOrThrow('person');
  const companyRecord = mockedCompanyRecords[0];

  jotaiStore.set(
    multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily({
      instanceId: componentInstanceId,
    }),
    [companyMetadata, personMetadata],
  );
  jotaiStore.set(searchRecordStoreFamilyState.atomFamily(companyRecord.id), {
    recordId: companyRecord.id,
    label: String(companyRecord.name),
    objectNameSingular: companyMetadata.nameSingular,
    objectLabelSingular: companyMetadata.labelSingular,
    imageUrl: '',
    tsRank: 0,
    tsRankCD: 0,
    record: companyRecord,
  });
};
