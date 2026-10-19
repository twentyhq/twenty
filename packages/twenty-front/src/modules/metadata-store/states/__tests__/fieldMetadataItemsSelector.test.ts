import { createStore } from 'jotai';

import { fieldMetadataItemsSelector } from '@/metadata-store/states/fieldMetadataItemsSelector';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const getCompanyFlatFieldMetadataItem = ({
  fieldName,
  icon,
}: {
  fieldName: string;
  icon: string | null;
}): FlatFieldMetadataItem => ({
  ...getMockFieldMetadataItemOrThrow({
    objectMetadataItem: companyObjectMetadataItem,
    fieldName,
  }),
  objectMetadataId: companyObjectMetadataItem.id,
  icon,
});

describe('fieldMetadataItemsSelector', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should fall back to the field type icon for fields without an icon', () => {
    const store = createStore();

    store.set(metadataStoreState.atomFamily('fieldMetadataItems'), {
      current: [
        getCompanyFlatFieldMetadataItem({ fieldName: 'name', icon: '' }),
        getCompanyFlatFieldMetadataItem({ fieldName: 'employees', icon: null }),
        getCompanyFlatFieldMetadataItem({
          fieldName: 'address',
          icon: 'IconBuilding',
        }),
      ],
      draft: [],
      status: 'up-to-date',
    });

    expect(
      store.get(fieldMetadataItemsSelector.atom).map(({ name, icon }) => ({
        name,
        icon,
      })),
    ).toEqual([
      { name: 'name', icon: 'IconAbc' },
      { name: 'employees', icon: 'IconNumbers' },
      { name: 'address', icon: 'IconBuilding' },
    ]);
  });
});
