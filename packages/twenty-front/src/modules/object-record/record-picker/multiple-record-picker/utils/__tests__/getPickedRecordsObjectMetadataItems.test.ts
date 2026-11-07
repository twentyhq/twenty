import { getPickedRecordsObjectMetadataItems } from '@/object-record/record-picker/multiple-record-picker/utils/getPickedRecordsObjectMetadataItems';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('getPickedRecordsObjectMetadataItems', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
  const personObjectMetadata = getMockObjectMetadataItemOrThrow('person');
  const companyObjectMetadata = getMockObjectMetadataItemOrThrow('company');

  it('adds the objects of picked records that are not searchable', () => {
    expect(
      getPickedRecordsObjectMetadataItems({
        searchableObjectMetadataItems: [personObjectMetadata],
        pickedMorphItems: [
          { objectMetadataId: companyObjectMetadata.id },
          { objectMetadataId: companyObjectMetadata.id },
          { objectMetadataId: personObjectMetadata.id },
        ],
        objectMetadataItems,
      }).map(({ nameSingular }) => nameSingular),
    ).toEqual(['person', 'company']);
  });

  it('keeps the searchable objects when nothing is picked', () => {
    expect(
      getPickedRecordsObjectMetadataItems({
        searchableObjectMetadataItems: [personObjectMetadata],
        pickedMorphItems: [],
        objectMetadataItems,
      }).map(({ nameSingular }) => nameSingular),
    ).toEqual(['person']);
  });
});
