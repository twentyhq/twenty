import { getRecordGqlFieldPaths } from '@/object-record/graphql/record-gql-fields/utils/getRecordGqlFieldPaths';

describe('getRecordGqlFieldPaths', () => {
  it('lists top-level fields and nested selections as dotted paths', () => {
    expect(
      getRecordGqlFieldPaths({
        id: true,
        company: { id: true, name: true, employees: true },
      }),
    ).toEqual(['id', 'company.id', 'company.name', 'company.employees']);
  });
});
