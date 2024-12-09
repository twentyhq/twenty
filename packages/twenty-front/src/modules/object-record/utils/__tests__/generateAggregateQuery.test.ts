import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateAggregateQuery } from '../generateAggregateQuery';

describe('generateAggregateQuery', () => {
  it('should generate correct aggregate query', () => {
    const mockObjectMetadataItem: ObjectMetadataItem = {
      nameSingular: 'company',
      namePlural: 'companies',
      id: 'test-id',
      labelSingular: 'Company',
      labelPlural: 'Companies',
      isCustom: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: [],
      indexMetadatas: [],
      isLabelSyncedWithName: true,
      isRemote: false,
      isSystem: false,
    };

    const mockRecordGqlFields = {
      id: true,
      name: true,
      address: false,
      createdAt: true,
    };

    const result = generateAggregateQuery({
      objectMetadataItem: mockObjectMetadataItem,
      recordGqlFields: mockRecordGqlFields,
    });

    const normalizedQuery = result.loc?.source.body.replace(/\s+/g, ' ').trim();

    expect(normalizedQuery).toBe(
      'query AggregateCompanies($filter: CompanyFilterInput) { companies(filter: $filter) { id name createdAt } }',
    );
  });

  it('should handle empty record fields', () => {
    const mockObjectMetadataItem: ObjectMetadataItem = {
      nameSingular: 'person',
      namePlural: 'people',
      id: 'test-id',
      labelSingular: 'Person',
      labelPlural: 'People',
      isCustom: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: [],
      indexMetadatas: [],
      isLabelSyncedWithName: true,
      isRemote: false,
      isSystem: false,
    };

    const mockRecordGqlFields = {
      id: true,
    };

    const result = generateAggregateQuery({
      objectMetadataItem: mockObjectMetadataItem,
      recordGqlFields: mockRecordGqlFields,
    });

    const normalizedQuery = result.loc?.source.body.replace(/\s+/g, ' ').trim();

    expect(normalizedQuery).toBe(
      'query AggregatePeople($filter: PersonFilterInput) { people(filter: $filter) { id } }',
    );
  });
});
