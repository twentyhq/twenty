import { normalizeGQLQuery } from '~/utils/normalizeGQLQuery';

describe('normalizeGQLQuery', () => {
  it('should produce consistent output for the same query', () => {
    const query = 'query { users { id name } }';

    const resultA = normalizeGQLQuery(query);
    const resultB = normalizeGQLQuery(query);

    expect(resultA).toBe(resultB);
  });

  it('should produce the same output regardless of whitespace', () => {
    const queryA = 'query { users { id name } }';
    const queryB = 'query{users{id name}}';

    expect(normalizeGQLQuery(queryA)).toBe(normalizeGQLQuery(queryB));
  });

  it('should return a string', () => {
    const result = normalizeGQLQuery('query { users { id } }');

    expect(typeof result).toBe('string');
  });
});
