import { useStore } from 'jotai';
import { useEffect } from 'react';

import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { multipleRecordPickerShouldShowInitialLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowInitialLoadingComponentState';
import { multipleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowSkeletonComponentState';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

type MultipleRecordPickerStoryInitializationEffectProps = {
  instanceId: string;
};

export const MultipleRecordPickerStoryInitializationEffect = ({
  instanceId,
}: MultipleRecordPickerStoryInitializationEffectProps) => {
  const store = useStore();

  useEffect(() => {
    const componentKey = { instanceId };
    const companyMetadata = getMockObjectMetadataItemOrThrow('company');
    const personMetadata = getMockObjectMetadataItemOrThrow('person');
    const companyRecord = mockedCompanyRecords[0];

    store.set(
      multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
        componentKey,
      ),
      [companyMetadata, personMetadata],
    );
    store.set(
      multipleRecordPickerPickableMorphItemsComponentState.atomFamily(
        componentKey,
      ),
      [],
    );
    store.set(
      multipleRecordPickerSearchFilterComponentState.atomFamily(componentKey),
      '',
    );
    store.set(
      multipleRecordPickerIsLoadingComponentState.atomFamily(componentKey),
      false,
    );
    store.set(
      multipleRecordPickerShouldShowInitialLoadingComponentState.atomFamily(
        componentKey,
      ),
      false,
    );
    store.set(
      multipleRecordPickerShouldShowSkeletonComponentState.atomFamily(
        componentKey,
      ),
      false,
    );
    store.set(searchRecordStoreFamilyState.atomFamily(companyRecord.id), {
      recordId: companyRecord.id,
      label: String(companyRecord.name),
      objectNameSingular: companyMetadata.nameSingular,
      objectLabelSingular: companyMetadata.labelSingular,
      imageUrl: '',
      tsRank: 0,
      tsRankCD: 0,
      record: companyRecord,
    });
  }, [instanceId, store]);

  return null;
};
