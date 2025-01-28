import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { InMemoryCache } from '@apollo/client';
import { expect } from '@storybook/test';

import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

describe('computeOptimisticRecordFromInput', () => {
  it('should generate correct optimistic record if no relation field is present', () => {
    const cache = new InMemoryCache();

    const personObjectMetadataItem = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    );

    if (!personObjectMetadataItem) {
      throw new Error('Person object metadata item not found');
    }

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

    const personObjectMetadataItem = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    );

    if (!personObjectMetadataItem) {
      throw new Error('Person object metadata item not found');
    }

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

  it('should generate correct optimistic record if relation field is present and cache is not empty', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    );

    if (!personObjectMetadataItem) {
      throw new Error('Person object metadata item not found');
    }

    const companyObjectMetadataItem = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'company',
    );

    if (!companyObjectMetadataItem) {
      throw new Error('Company object metadata item not found');
    }

    const companyRecord = {
      id: '123',
      __typename: 'Company',
    };

    updateRecordFromCache({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: {
        ...companyObjectMetadataItem,
        fields: companyObjectMetadataItem.fields.filter(
          (field) => field.name === 'id',
        ),
      },
      cache,
      record: companyRecord,
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

    const personObjectMetadataItem = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    );

    if (!personObjectMetadataItem) {
      throw new Error('Person object metadata item not found');
    }

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
});
