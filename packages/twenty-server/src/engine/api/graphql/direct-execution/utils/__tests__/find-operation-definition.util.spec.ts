import { parse } from 'graphql';

import { findOperationDefinition } from 'src/engine/api/graphql/direct-execution/utils/find-operation-definition.util';

describe('findOperationDefinition', () => {
  it('should return the single operation when no operationName is given', () => {
    const document = parse('query { findManyCompanies { id } }');

    const result = findOperationDefinition(document, undefined);

    expect(result).toBeDefined();
    expect(result?.name).toBeUndefined();
    expect(result?.operation).toBe('query');
  });

  it('should throw when multiple operations exist and no operationName is given', () => {
    const document = parse(`
      query First { findManyCompanies { id } }
      query Second { findManyPeople { id } }
    `);

    expect(() => findOperationDefinition(document, undefined)).toThrow(
      'Must provide operation name when document contains multiple operations.',
    );
  });

  it('should return the named operation when operationName matches', () => {
    const document = parse(`
      query First { findManyCompanies { id } }
      query Second { findManyPeople { id } }
    `);

    const result = findOperationDefinition(document, 'Second');

    expect(result?.name?.value).toBe('Second');
  });

  it('should return undefined when operationName does not match any operation', () => {
    const document = parse('query MyQuery { findManyCompanies { id } }');

    const result = findOperationDefinition(document, 'NonExistent');

    expect(result).toBeUndefined();
  });

  it('should return a mutation operation', () => {
    const document = parse(
      'mutation CreateOne { createOnePerson(data: {}) { id } }',
    );

    const result = findOperationDefinition(document, 'CreateOne');

    expect(result?.operation).toBe('mutation');
    expect(result?.name?.value).toBe('CreateOne');
  });

  it('should return undefined for an empty document', () => {
    const document = parse('type Query { dummy: String }');

    const result = findOperationDefinition(document, undefined);

    expect(result).toBeUndefined();
  });
});
