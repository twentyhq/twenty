import { parse } from 'graphql';

import { parseTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/parse-top-level-fields.util';

describe('parseTopLevelFields', () => {
  it('should return top-level fields from a query', () => {
    const query = `
      query {
        findManyCompanies { id name }
        findManyPeople { id email }
      }
    `;

    const fields = parseTopLevelFields(parse(query), undefined);

    expect(fields).toHaveLength(2);
    expect(fields[0].name.value).toBe('findManyCompanies');
    expect(fields[1].name.value).toBe('findManyPeople');
  });

  it('should return top-level fields from a mutation', () => {
    const query = `
      mutation {
        createOnePerson(data: { name: "Test" }) { id }
      }
    `;

    const fields = parseTopLevelFields(parse(query), undefined);

    expect(fields).toHaveLength(1);
    expect(fields[0].name.value).toBe('createOnePerson');
  });

  it('should select the operation matching operationName', () => {
    const query = `
      query GetCompanies {
        findManyCompanies { id }
      }
      query GetPeople {
        findManyPeople { id }
      }
    `;

    const fields = parseTopLevelFields(parse(query), 'GetPeople');

    expect(fields).toHaveLength(1);
    expect(fields[0].name.value).toBe('findManyPeople');
  });

  it('should throw when multiple operations exist and operationName is undefined', () => {
    const query = `
      query First {
        findManyCompanies { id }
      }
      query Second {
        findManyPeople { id }
      }
    `;

    expect(() => parseTopLevelFields(parse(query), undefined)).toThrow(
      'Must provide operation name when document contains multiple operations.',
    );
  });

  it('should return an empty array when no operation matches', () => {
    const query = `
      query GetCompanies {
        findManyCompanies { id }
      }
    `;

    const fields = parseTopLevelFields(parse(query), 'NonExistent');

    expect(fields).toEqual([]);
  });
});
