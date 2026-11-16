import { getRelatedRecordsWidgetSources } from '@/page-layout/widgets/field/utils/getRelatedRecordsWidgetSources';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

describe('getRelatedRecordsWidgetSources', () => {
  it('should keep has-many relations and resolve the object they list', () => {
    const sources = getRelatedRecordsWidgetSources({
      fieldMetadataItems: companyObjectMetadataItem.fields.filter((field) =>
        ['name', 'people', 'accountOwner'].includes(field.name),
      ),
      objectMetadataItems,
    });

    expect(sources).toHaveLength(1);
    expect(sources[0].fieldMetadataItem.name).toBe('people');
    expect(sources[0].targetObjectMetadataItem.id).toBe(
      personObjectMetadataItem.id,
    );
    expect(sources[0].inverseFieldMetadataId).toBe(
      sources[0].fieldMetadataItem.relation?.targetFieldMetadata.id,
    );
  });

  it('should list relations to system objects last', () => {
    const sources = getRelatedRecordsWidgetSources({
      fieldMetadataItems: companyObjectMetadataItem.fields.filter((field) =>
        ['attachments', 'people'].includes(field.name),
      ),
      objectMetadataItems,
    });

    expect(
      sources.map(({ fieldMetadataItem }) => fieldMetadataItem.name),
    ).toEqual(['people', 'attachments']);
  });

  it('should return no source for an object without has-many relations', () => {
    expect(
      getRelatedRecordsWidgetSources({
        fieldMetadataItems: companyObjectMetadataItem.fields.filter(
          (field) => field.name === 'name',
        ),
        objectMetadataItems,
      }),
    ).toEqual([]);
  });
});
