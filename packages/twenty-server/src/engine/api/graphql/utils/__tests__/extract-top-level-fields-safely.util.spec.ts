import { parse } from 'graphql';

import { extractTopLevelFieldsSafely } from 'src/engine/api/graphql/utils/extract-top-level-fields-safely.util';

const MULTI_OPERATION_QUERY = `
  query ReadPeople {
    findManyPeople {
      id
    }
  }
  mutation WipePeople {
    deleteManyPeople {
      id
    }
  }
`;

describe('extractTopLevelFieldsSafely', () => {
  const names = (query: string, operationName?: string): string[] =>
    extractTopLevelFieldsSafely(parse(query), operationName).map(
      (field) => field.name.value,
    );

  it('should extract every root field of a single operation', () => {
    expect(
      names('mutation { createOneCompany { id } deleteManyPeople { id } }'),
    ).toEqual(['createOneCompany', 'deleteManyPeople']);
  });

  it('should extract only the operation selected by operationName', () => {
    expect(names(MULTI_OPERATION_QUERY, 'ReadPeople')).toEqual([
      'findManyPeople',
    ]);
    expect(names(MULTI_OPERATION_QUERY, 'WipePeople')).toEqual([
      'deleteManyPeople',
    ]);
  });

  it('should not depend on the client supplied operation name', () => {
    expect(names('mutation LooksHarmless { deleteManyPeople { id } }')).toEqual(
      ['deleteManyPeople'],
    );
  });

  it('should extract nothing when operationName selects no operation', () => {
    expect(names(MULTI_OPERATION_QUERY, 'Unknown')).toEqual([]);
  });

  it('should not throw when the document is ambiguous', () => {
    expect(names(MULTI_OPERATION_QUERY)).toEqual([]);
  });

  it('should follow a fragment spread at the root', () => {
    expect(
      names(`
        query ReadPeople {
          ...RootFields
        }
        fragment RootFields on Query {
          findManyPeople {
            id
          }
        }
      `),
    ).toEqual(['findManyPeople']);
  });
});
