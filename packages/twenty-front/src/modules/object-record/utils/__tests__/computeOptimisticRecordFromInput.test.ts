import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { InMemoryCache } from '@apollo/client';
import { getCompanyObjectMetadataItem } from '~/testing/mock-data/companies';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getPersonObjectMetadaItem } from '~/testing/mock-data/people';

describe('computeOptimisticRecordFromInput', () => {
  it('should generate correct optimistic record if no relation field is present', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadaItem();

    const result = computeOptimisticRecordFromInput({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        city: 'Paris',
      },
      cache,
    });

    expect(result).toEqual({
      city: 'Paris',
    });
  });

  it('should generate correct optimistic record if relation field is present but cache is empty', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadaItem();

    const result = computeOptimisticRecordFromInput({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        companyId: '123',
      },
      cache,
    });

    expect(result).toEqual({
      companyId: '123',
    });
  });

  it('should generate correct optimistic record even if recordInput contains field __typename', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadaItem();
    const companyObjectMetadataItem = getCompanyObjectMetadataItem();

    const companyRecord = {
      id: '123',
      __typename: 'Company',
    };

    const objectMetadataItem: ObjectMetadataItem = {
      ...companyObjectMetadataItem,
      fields: companyObjectMetadataItem.fields.filter(
        (field) => field.name === 'id',
      ),
    };
    const recordGqlFields = generateDepthOneRecordGqlFields({
      objectMetadataItem,
      record: companyRecord,
    });
    updateRecordFromCache({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem,
      cache,
      record: companyRecord,
      recordGqlFields,
    });

    const result = computeOptimisticRecordFromInput({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        companyId: '123',
        __typename: 'test',
      },
      cache,
    });

    expect(result).toStrictEqual({
      companyId: '123',
      company: companyRecord,
    });
  });

  it('should generate correct optimistic record if relation field is present and cache is not empty', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadaItem();
    const companyObjectMetadataItem = getCompanyObjectMetadataItem();

    const companyRecord = {
      id: '123',
      __typename: 'Company',
    };

    const objectMetadataItem: ObjectMetadataItem = {
      ...companyObjectMetadataItem,
      fields: companyObjectMetadataItem.fields.filter(
        (field) => field.name === 'id',
      ),
    };
    const recordGqlFields = generateDepthOneRecordGqlFields({
      objectMetadataItem,
      record: companyRecord,
    });
    updateRecordFromCache({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem,
      cache,
      record: companyRecord,
      recordGqlFields,
    });

    const result = computeOptimisticRecordFromInput({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        companyId: '123',
      },
      cache,
    });

    expect(result).toEqual({
      companyId: '123',
      company: companyRecord,
    });
  });

  it('should generate correct optimistic record if relation field is null and cache is empty', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadaItem();

    const result = computeOptimisticRecordFromInput({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        companyId: null,
      },
      cache,
    });

    expect(result).toEqual({
      companyId: null,
      company: null,
    });
  });

  it('should throw an error if recordInput contains fields unrelated to the current objectMetadata', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadaItem();

    expect(() =>
      computeOptimisticRecordFromInput({
        objectMetadataItems: generatedMockObjectMetadataItems,
        objectMetadataItem: personObjectMetadataItem,
        recordInput: {
          unknwon: 'unknown',
          foo: 'foo',
          bar: 'bar',
          city: 'Paris',
        },
        cache,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Should never occur, encountered unknown fields unknwon, foo, bar in objectMetadaItem person"`,
    );
  });

  it('should throw an error if recordInput contains both the relationFieldId and relationField', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadaItem();

    expect(() =>
      computeOptimisticRecordFromInput({
        objectMetadataItems: generatedMockObjectMetadataItems,
        objectMetadataItem: personObjectMetadataItem,
        recordInput: {
          companyId: '123',
          company: {},
        },
        cache,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Should never provide relation mutation through anything else than the fieldId e.g companyId and not company, encountered: company"`,
    );
  });

  it('should throw an error if recordInput contains both the relationFieldId and relationField even if null', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadaItem();

    expect(() =>
      computeOptimisticRecordFromInput({
        objectMetadataItems: generatedMockObjectMetadataItems,
        objectMetadataItem: personObjectMetadataItem,
        recordInput: {
          companyId: '123',
          company: null,
        },
        cache,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Should never provide relation mutation through anything else than the fieldId e.g companyId and not company, encountered: company"`,
    );
  });
});
