import { parse } from 'graphql';

import { isSubscriptionOperation } from 'src/engine/api/graphql/direct-execution/utils/is-subscription-operation.util';

describe('isSubscriptionOperation', () => {
  it('should return true for a subscription operation', () => {
    const query = 'subscription { onCreateCompany { id } }';

    expect(isSubscriptionOperation(parse(query), undefined)).toBe(true);
  });

  it('should return true for a named subscription matching operationName', () => {
    const query = `
      subscription OnCreate { onCreateCompany { id } }
      query GetAll { findManyCompanies { id } }
    `;

    expect(isSubscriptionOperation(parse(query), 'OnCreate')).toBe(true);
  });

  it('should return false for a query operation', () => {
    const query = 'query { findManyCompanies { id } }';

    expect(isSubscriptionOperation(parse(query), undefined)).toBe(false);
  });

  it('should return false for a mutation operation', () => {
    const query = 'mutation { createOnePerson(data: {}) { id } }';

    expect(isSubscriptionOperation(parse(query), undefined)).toBe(false);
  });
});
