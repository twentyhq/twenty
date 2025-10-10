import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { type RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { generateCombinedFindManyRecordsQueryVariables } from '@/object-record/multiple-objects/utils/generateCombinedFindManyRecordsQueryVariables';

describe('useCombinedFindManyRecordsQueryVariables', () => {
  it('should generate variables with after cursor and first limit', () => {
    const operationSignatures: RecordGqlOperationSignature[] = [
      {
        objectNameSingular: 'person',
        fields: {
          id: true,
          name: {
            firstName: true,
            lastName: true,
          },
        } satisfies RecordGqlFields,
        variables: {
          filter: { id: { eq: '123' } },
          orderBy: [{ createdAt: 'AscNullsLast' }],
          limit: 10,
          cursorFilter: {
            cursor: 'cursor123',
            cursorDirection: 'after',
          },
        },
      },
    ];

    const result = generateCombinedFindManyRecordsQueryVariables({
      operationSignatures,
    });

    expect(result).toEqual({
      filterPerson: { id: { eq: '123' } },
      orderByPerson: [{ createdAt: 'AscNullsLast' }],
      afterPerson: 'cursor123',
      firstPerson: 10,
    });
  });

  it('should generate variables with before cursor and last limit', () => {
    const operationSignatures: RecordGqlOperationSignature[] = [
      {
        objectNameSingular: 'person',
        fields: {
          id: true,
          name: true,
        } as RecordGqlFields,
        variables: {
          filter: { id: { eq: '123' } },
          orderBy: [{ createdAt: 'AscNullsLast' }],
          limit: 10,
          cursorFilter: {
            cursor: 'cursor123',
            cursorDirection: 'before',
          },
        },
      },
    ];

    const result = generateCombinedFindManyRecordsQueryVariables({
      operationSignatures,
    });

    expect(result).toEqual({
      filterPerson: { id: { eq: '123' } },
      orderByPerson: [{ createdAt: 'AscNullsLast' }],
      beforePerson: 'cursor123',
      lastPerson: 10,
    });
  });

  it('should generate variables with limit only (no cursor)', () => {
    const operationSignatures: RecordGqlOperationSignature[] = [
      {
        objectNameSingular: 'person',
        fields: {
          id: true,
          name: true,
        } as RecordGqlFields,
        variables: {
          filter: { id: { eq: '123' } },
          orderBy: [{ createdAt: 'AscNullsLast' }],
          limit: 10,
        },
      },
    ];

    const result = generateCombinedFindManyRecordsQueryVariables({
      operationSignatures,
    });

    expect(result).toEqual({
      filterPerson: { id: { eq: '123' } },
      orderByPerson: [{ createdAt: 'AscNullsLast' }],
      limitPerson: 10,
    });
  });

  it('should handle multiple objects with different pagination strategies', () => {
    const operationSignatures: RecordGqlOperationSignature[] = [
      {
        objectNameSingular: 'person',
        fields: {
          id: true,
        } as RecordGqlFields,
        variables: {
          filter: { id: { eq: '123' } },
          limit: 10,
          cursorFilter: {
            cursor: 'cursor123',
            cursorDirection: 'after',
          },
        },
      },
      {
        objectNameSingular: 'company',
        fields: {
          id: true,
        } as RecordGqlFields,
        variables: {
          filter: { name: { eq: 'Twenty' } },
          limit: 20,
        },
      },
    ];

    const result = generateCombinedFindManyRecordsQueryVariables({
      operationSignatures,
    });

    expect(result).toEqual({
      filterPerson: { id: { eq: '123' } },
      afterPerson: 'cursor123',
      firstPerson: 10,
      filterCompany: { name: { eq: 'Twenty' } },
      limitCompany: 20,
    });
  });

  it('should handle empty operation signatures', () => {
    const result = generateCombinedFindManyRecordsQueryVariables({
      operationSignatures: [],
    });

    expect(result).toEqual({});
  });

  it('should handle empty variables', () => {
    const operationSignatures: RecordGqlOperationSignature[] = [
      {
        objectNameSingular: 'person',
        fields: {
          id: true,
        } as RecordGqlFields,
        variables: {},
      },
    ];

    const result = generateCombinedFindManyRecordsQueryVariables({
      operationSignatures,
    });

    expect(result).toEqual({});
  });

  it('should handle cursor without limit', () => {
    const operationSignatures: RecordGqlOperationSignature[] = [
      {
        objectNameSingular: 'person',
        fields: {
          id: true,
        } as RecordGqlFields,
        variables: {
          cursorFilter: {
            cursor: 'cursor123',
            cursorDirection: 'after',
          },
        },
      },
    ];

    const result = generateCombinedFindManyRecordsQueryVariables({
      operationSignatures,
    });

    expect(result).toEqual({
      afterPerson: 'cursor123',
    });
  });
});
