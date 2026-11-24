import { getRecordFieldColumnKind } from '@/object-record/record-column-scope/utils/getRecordFieldColumnKind';
import { getScopedRelationAliases } from '@/object-record/record-column-scope/utils/getScopedRelationAliases';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import {
  type ViewFieldRelationScope,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const personCompanyField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'company',
});
const companyNameField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});
const companyPeopleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'people',
});
const personEmailsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'emails',
});
const personJobTitleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'jobTitle',
});
const personCreatedAtField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'createdAt',
});

const COLUMN_ID = '20202020-0000-4000-8000-0000000000c1';

const CTO_RELATION_SCOPE: ViewFieldRelationScope = {
  filters: [
    {
      id: '20202020-0000-4000-8000-0000000000f1',
      fieldMetadataId: personJobTitleField.id,
      operand: ViewFilterOperand.CONTAINS,
      value: 'cto',
    },
  ],
  filterGroups: [],
  sorts: [],
};

const withoutReadablePersonField = (unreadableFieldMetadataItemId: string) =>
  objectMetadataItems.map((objectMetadataItem) =>
    objectMetadataItem.id === personObjectMetadataItem.id
      ? {
          ...objectMetadataItem,
          readableFields: objectMetadataItem.readableFields.filter(
            ({ id }) => id !== unreadableFieldMetadataItemId,
          ),
        }
      : objectMetadataItem,
  );

// Resolves the aliases first, as the provider does, so each kind comes from a real alias
const getColumnKind = ({
  recordField,
  fieldMetadataItem = companyPeopleField,
  readableObjectMetadataItems = objectMetadataItems,
  isLookupColumnsEnabled = true,
}: {
  recordField: Partial<
    Pick<
      RecordField,
      'isCanonical' | 'relationScope' | 'relationTargetFieldMetadataId'
    >
  >;
  fieldMetadataItem?: FieldMetadataItem;
  readableObjectMetadataItems?: typeof objectMetadataItems;
  isLookupColumnsEnabled?: boolean;
}) => {
  const fullRecordField = {
    id: COLUMN_ID,
    fieldMetadataItemId: fieldMetadataItem.id,
    isCanonical: false,
    ...recordField,
  };

  const [scopedRelationAlias] = getScopedRelationAliases({
    recordFields: [fullRecordField],
    fieldMetadataItemByFieldMetadataItemId: {
      [fieldMetadataItem.id]: fieldMetadataItem,
    },
    objectMetadataItems: readableObjectMetadataItems,
    fieldMetadataItems: readableObjectMetadataItems.flatMap(
      ({ fields }) => fields,
    ),
    filterValueDependencies: {},
    isLookupColumnsEnabled,
  });

  return getRecordFieldColumnKind({
    recordField: fullRecordField,
    fieldMetadataItem,
    scopedRelationAlias,
    objectMetadataItems: readableObjectMetadataItems,
    isLookupColumnsEnabled,
  });
};

describe('getRecordFieldColumnKind', () => {
  it('resolves the canonical column of a field as the field', () => {
    expect(
      getColumnKind({
        recordField: { isCanonical: true },
        fieldMetadataItem: personCompanyField,
      }),
    ).toEqual({ kind: 'field' });
  });

  it('resolves a many-to-one column showing a field of its related record as a lookup', () => {
    expect(
      getColumnKind({
        recordField: { relationTargetFieldMetadataId: companyNameField.id },
        fieldMetadataItem: personCompanyField,
      }),
    ).toEqual({
      kind: 'lookup',
      lookupTarget: expect.objectContaining({
        relationFieldName: 'company',
        lookupTargetFieldMetadataItem: expect.objectContaining({
          id: companyNameField.id,
        }),
      }),
    });
  });

  it('resolves a scoped one-to-many column as its scoped records', () => {
    const columnKind = getColumnKind({
      recordField: { relationScope: CTO_RELATION_SCOPE },
    });

    expect(columnKind).toEqual({
      kind: 'scopedRecords',
      scopedRelationAlias: expect.objectContaining({
        recordFieldId: COLUMN_ID,
        isRestricted: false,
      }),
    });
  });

  it('resolves a scoped column showing a field of its records as a scoped lookup', () => {
    expect(
      getColumnKind({
        recordField: {
          relationScope: CTO_RELATION_SCOPE,
          relationTargetFieldMetadataId: personEmailsField.id,
        },
      }),
    ).toEqual({
      kind: 'scopedLookup',
      scopedRelationAlias: expect.objectContaining({ isRestricted: false }),
      lookupTarget: expect.objectContaining({
        lookupTargetFieldMetadataItem: expect.objectContaining({
          id: personEmailsField.id,
        }),
      }),
    });
  });

  it('resolves a scoped column with an aggregate operation as a summary', () => {
    expect(
      getColumnKind({
        recordField: {
          relationScope: {
            ...CTO_RELATION_SCOPE,
            aggregateOperation: AggregateOperations.COUNT,
          },
        },
      }),
    ).toEqual({
      kind: 'summary',
      scopedRelationAlias: expect.objectContaining({ isRestricted: false }),
      summary: expect.objectContaining({
        aggregateGqlFieldName: 'totalCount',
      }),
    });
  });

  it('keeps the kind of a scoped column whose scope reaches an unreadable field, flagged restricted', () => {
    expect(
      getColumnKind({
        recordField: { relationScope: CTO_RELATION_SCOPE },
        readableObjectMetadataItems: withoutReadablePersonField(
          personJobTitleField.id,
        ),
      }),
    ).toEqual({
      kind: 'scopedRecords',
      scopedRelationAlias: expect.objectContaining({ isRestricted: true }),
    });
  });

  it('keeps a summary of an unreadable field a summary, restricted and without its summary', () => {
    const columnKind = getColumnKind({
      recordField: {
        relationScope: {
          ...CTO_RELATION_SCOPE,
          aggregateOperation: AggregateOperations.MIN,
        },
        relationTargetFieldMetadataId: personCreatedAtField.id,
      },
      readableObjectMetadataItems: withoutReadablePersonField(
        personCreatedAtField.id,
      ),
    });

    expect(columnKind).toEqual({
      kind: 'summary',
      scopedRelationAlias: expect.objectContaining({ isRestricted: true }),
      summary: undefined,
    });
  });

  it.each([
    {
      title: 'a lookup column',
      recordField: { relationTargetFieldMetadataId: companyNameField.id },
      fieldMetadataItem: personCompanyField,
    },
    {
      title: 'a scoped column',
      recordField: { relationScope: CTO_RELATION_SCOPE },
      fieldMetadataItem: companyPeopleField,
    },
  ])(
    'resolves $title as the field while lookup columns are disabled',
    ({ recordField, fieldMetadataItem }) => {
      expect(
        getColumnKind({
          recordField,
          fieldMetadataItem,
          isLookupColumnsEnabled: false,
        }),
      ).toEqual({ kind: 'field' });
    },
  );

  it('resolves a column of an unknown field as the field', () => {
    expect(
      getRecordFieldColumnKind({
        recordField: { relationTargetFieldMetadataId: companyNameField.id },
        fieldMetadataItem: undefined,
        scopedRelationAlias: undefined,
        objectMetadataItems,
        isLookupColumnsEnabled: true,
      }),
    ).toEqual({ kind: 'field' });
  });
});
