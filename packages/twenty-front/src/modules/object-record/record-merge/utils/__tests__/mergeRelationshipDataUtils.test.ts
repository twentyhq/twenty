import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { mergeManyToOneRelationship } from '@/object-record/record-merge/utils/mergeManyToOneRelationship';
import { mergeOneToManyRelationships } from '@/object-record/record-merge/utils/mergeOneToManyRelationships';
import { mergeRecordRelationshipData } from '@/object-record/record-merge/utils/mergeRelationshipData';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

describe('mergeOneToManyRelationships', () => {
  it('should merge one-to-many relationships and remove duplicates', () => {
    const records: ObjectRecord[] = [
      {
        __typename: 'Company',
        id: 'record1',
        opportunities: [
          { __typename: 'Opportunity', id: 'opp1', name: 'Opportunity 1' },
          { __typename: 'Opportunity', id: 'opp2', name: 'Opportunity 2' },
        ],
      },
      {
        __typename: 'Company',
        id: 'record2',
        opportunities: [
          { __typename: 'Opportunity', id: 'opp2', name: 'Opportunity 2' }, // Duplicate
          { __typename: 'Opportunity', id: 'opp3', name: 'Opportunity 3' },
        ],
      },
    ];

    const result = mergeOneToManyRelationships(records, 'opportunities');

    expect(result).toHaveLength(3);
    expect(result).toEqual([
      { __typename: 'Opportunity', id: 'opp1', name: 'Opportunity 1' },
      { __typename: 'Opportunity', id: 'opp2', name: 'Opportunity 2' },
      { __typename: 'Opportunity', id: 'opp3', name: 'Opportunity 3' },
    ]);
  });

  it('should handle empty arrays', () => {
    const records: ObjectRecord[] = [
      {
        __typename: 'Company',
        id: 'record1',
        opportunities: [],
      },
      {
        __typename: 'Company',
        id: 'record2',
        opportunities: [],
      },
    ];

    const result = mergeOneToManyRelationships(records, 'opportunities');

    expect(result).toEqual([]);
  });

  it('should handle records with null or undefined relationship values', () => {
    const records: ObjectRecord[] = [
      {
        __typename: 'Company',
        id: 'record1',
        opportunities: [
          { __typename: 'Opportunity', id: 'opp1', name: 'Opportunity 1' },
        ],
      },
      {
        __typename: 'Company',
        id: 'record2',
        opportunities: null,
      },
      {
        __typename: 'Company',
        id: 'record3',
        opportunities: undefined,
      },
    ];

    const result = mergeOneToManyRelationships(records, 'opportunities');

    expect(result).toEqual([
      { __typename: 'Opportunity', id: 'opp1', name: 'Opportunity 1' },
    ]);
  });

  it('should handle empty records array', () => {
    const result = mergeOneToManyRelationships([], 'opportunities');

    expect(result).toEqual([]);
  });
});

describe('mergeManyToOneRelationship', () => {
  it('should return the first non-null value', () => {
    const records: ObjectRecord[] = [
      {
        __typename: 'Person',
        id: 'record1',
        company: null,
      },
      {
        __typename: 'Person',
        id: 'record2',
        company: { __typename: 'Company', id: 'company1', name: 'Company 1' },
      },
      {
        __typename: 'Person',
        id: 'record3',
        company: { __typename: 'Company', id: 'company2', name: 'Company 2' },
      },
    ];

    const result = mergeManyToOneRelationship(records, 'company');

    expect(result).toEqual({
      __typename: 'Company',
      id: 'company1',
      name: 'Company 1',
    });
  });

  it('should return the first non-undefined value', () => {
    const records: ObjectRecord[] = [
      {
        __typename: 'Person',
        id: 'record1',
        company: undefined,
      },
      {
        __typename: 'Person',
        id: 'record2',
        company: { __typename: 'Company', id: 'company1', name: 'Company 1' },
      },
    ];

    const result = mergeManyToOneRelationship(records, 'company');

    expect(result).toEqual({
      __typename: 'Company',
      id: 'company1',
      name: 'Company 1',
    });
  });

  it('should return null if all values are null or undefined', () => {
    const records: ObjectRecord[] = [
      {
        __typename: 'Person',
        id: 'record1',
        company: null,
      },
      {
        __typename: 'Person',
        id: 'record2',
        company: undefined,
      },
    ];

    const result = mergeManyToOneRelationship(records, 'company');

    expect(result).toBeNull();
  });

  it('should handle empty records array', () => {
    const result = mergeManyToOneRelationship([], 'company');

    expect(result).toBeNull();
  });
});

describe('mergeRecordRelationshipData', () => {
  const mockFieldMetadataItems: FieldMetadataItem[] = [
    {
      id: 'field1',
      name: 'opportunities',
      type: FieldMetadataType.RELATION,
      relation: {
        type: RelationType.ONE_TO_MANY,
      },
    } as FieldMetadataItem,
    {
      id: 'field2',
      name: 'company',
      type: FieldMetadataType.RELATION,
      relation: {
        type: RelationType.MANY_TO_ONE,
      },
    } as FieldMetadataItem,
    {
      id: 'field3',
      name: 'name',
      type: FieldMetadataType.TEXT,
    } as FieldMetadataItem,
  ];

  it('should merge all relationship fields correctly', () => {
    const records: ObjectRecord[] = [
      {
        __typename: 'Company',
        id: 'record1',
        opportunities: [
          { __typename: 'Opportunity', id: 'opp1', name: 'Opportunity 1' },
          { __typename: 'Opportunity', id: 'opp2', name: 'Opportunity 2' },
        ],
        company: null,
        name: 'Record 1',
      },
      {
        __typename: 'Company',
        id: 'record2',
        opportunities: [
          { __typename: 'Opportunity', id: 'opp2', name: 'Opportunity 2' },
          { __typename: 'Opportunity', id: 'opp3', name: 'Opportunity 3' },
        ],
        company: { __typename: 'Company', id: 'company1', name: 'Company 1' },
        name: 'Record 2',
      },
    ];

    const result = mergeRecordRelationshipData(
      records,
      mockFieldMetadataItems,
      false,
    );

    expect(result).toEqual({
      opportunities: [
        { __typename: 'Opportunity', id: 'opp1', name: 'Opportunity 1' },
        { __typename: 'Opportunity', id: 'opp2', name: 'Opportunity 2' },
        { __typename: 'Opportunity', id: 'opp3', name: 'Opportunity 3' },
      ],
      company: { __typename: 'Company', id: 'company1', name: 'Company 1' },
    });
  });

  it('should return empty object when isLoading is true', () => {
    const records: ObjectRecord[] = [
      {
        __typename: 'Company',
        id: 'record1',
        opportunities: [
          { __typename: 'Opportunity', id: 'opp1', name: 'Opportunity 1' },
        ],
        company: { __typename: 'Company', id: 'company1', name: 'Company 1' },
      },
    ];

    const result = mergeRecordRelationshipData(
      records,
      mockFieldMetadataItems,
      true,
    );

    expect(result).toEqual({});
  });

  it('should return empty object when records array is empty', () => {
    const result = mergeRecordRelationshipData(
      [],
      mockFieldMetadataItems,
      false,
    );

    expect(result).toEqual({});
  });

  it('should only process relation fields', () => {
    const records: ObjectRecord[] = [
      {
        __typename: 'Company',
        id: 'record1',
        opportunities: [
          { __typename: 'Opportunity', id: 'opp1', name: 'Opportunity 1' },
        ],
        company: { __typename: 'Company', id: 'company1', name: 'Company 1' },
        name: 'Record 1',
        email: 'test@example.com',
      },
    ];

    const result = mergeRecordRelationshipData(
      records,
      mockFieldMetadataItems,
      false,
    );

    expect(result).toEqual({
      opportunities: [
        { __typename: 'Opportunity', id: 'opp1', name: 'Opportunity 1' },
      ],
      company: { __typename: 'Company', id: 'company1', name: 'Company 1' },
    });
    expect(result).not.toHaveProperty('name');
    expect(result).not.toHaveProperty('email');
  });

  it('should handle fields without relation metadata', () => {
    const fieldsWithoutRelation: FieldMetadataItem[] = [
      {
        id: 'field1',
        name: 'opportunities',
        type: FieldMetadataType.RELATION,
        relation: null,
      } as FieldMetadataItem,
    ];

    const records: ObjectRecord[] = [
      {
        __typename: 'Company',
        id: 'record1',
        opportunities: [
          { __typename: 'Opportunity', id: 'opp1', name: 'Opportunity 1' },
        ],
      },
    ];

    const result = mergeRecordRelationshipData(
      records,
      fieldsWithoutRelation,
      false,
    );

    expect(result).toEqual({});
  });

  it('should handle unknown relation types gracefully', () => {
    const fieldsWithUnknownRelation: FieldMetadataItem[] = [
      {
        id: 'field1',
        name: 'unknownRelation',
        type: FieldMetadataType.RELATION,
        relation: {
          type: 'UNKNOWN_TYPE' as RelationType,
        },
      } as FieldMetadataItem,
    ];

    const records: ObjectRecord[] = [
      {
        __typename: 'Person',
        id: 'record1',
        unknownRelation: [
          { __typename: 'Unknown', id: 'unknown1', name: 'Unknown 1' },
        ],
      },
    ];

    const result = mergeRecordRelationshipData(
      records,
      fieldsWithUnknownRelation,
      false,
    );

    expect(result).toEqual({});
  });
});
