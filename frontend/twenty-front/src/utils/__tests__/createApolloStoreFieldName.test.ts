import { createApolloStoreFieldName } from '~/utils/createApolloStoreFieldName';

describe('createApolloStoreFieldName', () => {
  it('should create field name with simple variables', () => {
    const result = createApolloStoreFieldName({
      fieldName: 'users',
      fieldVariables: { limit: 10 },
    });

    expect(result).toBe('users({"limit":10})');
  });

  it('should create field name with complex variables', () => {
    const result = createApolloStoreFieldName({
      fieldName: 'companies',
      fieldVariables: {
        filter: { name: { ilike: '%test%' } },
        orderBy: [{ createdAt: 'DESC' }],
        first: 20,
      },
    });

    expect(result).toBe(
      'companies({"filter":{"name":{"ilike":"%test%"}},"orderBy":[{"createdAt":"DESC"}],"first":20})',
    );
  });

  it('should create field name with null and undefined values', () => {
    const result = createApolloStoreFieldName({
      fieldName: 'records',
      fieldVariables: {
        id: null,
        name: undefined,
        active: true,
      },
    });

    expect(result).toBe('records({"id":null,"active":true})');
  });
});
